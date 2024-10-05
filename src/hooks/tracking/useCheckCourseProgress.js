import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { checkCourseCompletion } from '@/db/models/userCourseModels';

const useCheckCourseProgress = () => {
  const { data: session } = useSession();

  useEffect(() => {
    const updateCourseCompletionStatus = async () => {
      if (!session?.user) return;

      const userId = session.user.id;
      const userCourses = session.user.userCourses;

      for (const userCourse of userCourses) {
        const courseId = userCourse.courseId;
        const isCompleted = await checkCourseCompletion(userId, courseId);

        if (isCompleted) {
          try {
            await axios.put(`/api/users/${userId}/courses/${courseId}`, {
              completed: true,
              completedAt: new Date().toISOString(),
            });
            console.log(`Course ${courseId} marked as completed for user ${userId}`);
          } catch (error) {
            console.error(`Failed to update course ${courseId} completion status:`, error);
          }
        }
      }
    };

    updateCourseCompletionStatus();
  }, [session]);

  return null;
};

export default useCheckCourseProgress;