import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const useCheckCourseProgress = () => {
  const { data: session, update } = useSession();

  useEffect(() => {
    const updateCourseCompletionStatus = async () => {
      if (!session?.user) return;

      const userId = session.user.id;
      const userCourses = session.user.userCourses;

      for (const userCourse of userCourses) {
        const courseId = userCourse.courseId;

        try {
          const response = await axios.get(`/api/users/${userId}/courses/${courseId}`);
          console.log("RESPONSE", response.data);
          const isCompleted = response.data.completed;
          console.log("IS COMPLETED", isCompleted);

          if (isCompleted && !userCourse.completed) {
            await axios.put(`/api/users/${userId}/courses/${courseId}`, {
              completed: true,
              completedAt: new Date().toISOString(),
            });
            update()
            console.log(`Course ${courseId} marked as completed for user ${userId}`);
          }
        } catch (error) {
          console.error(`Failed to update course ${courseId} completion status:`, error);
        }
      }
    };

    updateCourseCompletionStatus();
  }, [session, update]);

  return null;
};

export default useCheckCourseProgress;