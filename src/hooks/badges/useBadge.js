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
        if (!session?.user || isProcessing) return;

        const checkForBadgeEligibility = async () => {
            setIsProcessing(true);
            setError(null);
            
            try {
                const { userBadges } = session.user;
                let badgesAwarded = false;

                // Check for GitHub connection badge
                if (session?.account?.provider === 'github') {
                    const hasPlebBadge = userBadges?.some(
                        userBadge => userBadge.badge?.id === 'd055608f-1bbb-43fc-bddd-c207e5b20d61'
                    );

                    if (!hasPlebBadge) {
                        try {
                            const response = await axios.post('/api/badges/issue', {
                                badgeId: 'd055608f-1bbb-43fc-bddd-c207e5b20d61',
                                userId: session.user.id,
                            });

                            if (response.data.success) {
                                badgesAwarded = true;
                            }
                        } catch (error) {
                            console.error('Error issuing Pleb badge:', error);
                        }
                    }
                }

                // Check for course-related badges
                const eligibleCourses = completedCourses?.filter(userCourse => {
                    const isCompleted = userCourse.completed;
                    const hasNoBadge = !userBadges?.some(
                        userBadge => userBadge.badge?.courseId === userCourse.courseId
                    );
                    const hasBadgeDefined = !!userCourse.course?.badge;
                    
                    // Check if course requires repo submission
                    const requiresRepo = userCourse.course?.submissionRequired ?? false;
                    const hasRepoIfRequired = requiresRepo ? !!userCourse.submittedRepoLink : true;

                    return isCompleted && hasNoBadge && hasBadgeDefined && hasRepoIfRequired;
                });

                for (const course of eligibleCourses || []) {
                    try {
                        const response = await axios.post('/api/badges/issue', {
                            courseId: course?.courseId,
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
                    // First invalidate the queries
                    await queryClient.invalidateQueries(['completedCourses']);
                    await queryClient.invalidateQueries(['githubCommits']);
                    
                    // Wait a brief moment before updating session
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Update session last
                    await update({ revalidate: false });
                    
                    // Force a refetch of the invalidated queries
                    await Promise.all([
                        queryClient.refetchQueries(['completedCourses']),
                        queryClient.refetchQueries(['githubCommits'])
                    ]);
                }
            } catch (error) {
                console.error('Error checking badge eligibility:', error);
                setError(error.message);
            } finally {
                setIsProcessing(false);
            }
        };

        const timeoutId = setTimeout(checkForBadgeEligibility, 0);
        // Reduce the frequency of checks to avoid potential race conditions
        const interval = setInterval(checkForBadgeEligibility, 600000); // 10 minutes

        return () => {
            clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, [session?.user?.id, completedCourses]);

    return { isProcessing, error };
};