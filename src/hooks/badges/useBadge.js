import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useCompletedCoursesQuery } from '../apiQueries/useCompletedCoursesQuery';
import { useQueryClient } from '@tanstack/react-query';

export const useBadge = () => {
    const { data: session, update } = useSession();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const { data: completedCourses } = useCompletedCoursesQuery();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!session?.user || isProcessing || !completedCourses) return;

        const checkForBadgeEligibility = async () => {
            setIsProcessing(true);
            setError(null);
            
            try {
                const { userBadges } = session.user;
                let badgesAwarded = false;

                const eligibleCourses = completedCourses?.filter(userCourse => {
                    const isCompleted = userCourse.completed;
                    const hasNoBadge = !userBadges?.some(
                        userBadge => userBadge.badge?.courseId === userCourse.courseId
                    );
                    const hasBadgeDefined = !!userCourse.course?.badge;

                    return isCompleted && hasNoBadge && hasBadgeDefined;
                });

                for (const course of eligibleCourses || []) {
                    try {
                        const response = await axios.post('/api/badges/issue', {
                            courseId: course.courseId,
                            userId: session.user.id,
                        });

                        if (response.data.success) {
                            badgesAwarded = true;
                        }
                    } catch (error) {
                        console.error('Error issuing badge:', error);
                    }
                }

                if (badgesAwarded) {
                    // Update session silently
                    await update({ revalidate: false });
                    // Invalidate the completed courses query to trigger a clean refetch
                    await queryClient.invalidateQueries(['completedCourses']);
                }
            } catch (error) {
                console.error('Error checking badge eligibility:', error);
                setError(error.message);
            } finally {
                setIsProcessing(false);
            }
        };

        const timeoutId = setTimeout(checkForBadgeEligibility, 0);
        const interval = setInterval(checkForBadgeEligibility, 300000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, [session?.user?.id, completedCourses]);

    return { isProcessing, error };
};