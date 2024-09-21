import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useSession} from 'next-auth/react';
import axios from 'axios';

const useTrackCourse = ({courseId}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const {data: session} = useSession();
  const completedRef = useRef(false);

  const checkOrCreateUserCourse = useCallback(async () => {
    if (!session?.user) return false;
    try {
      const response = await axios.get(`/api/users/${session.user.id}/courses/${courseId}`);
      if (response.status === 200 && response?.data) {
        setIsCompleted(true);
        completedRef.current = true;
      } else if (response.status === 204) {
        await axios.post(`/api/users/${session.user.id}/courses?courseSlug=${courseId}`, {
          completed: false,
          started: true,
          startedAt: new Date().toISOString(),
        });

        setIsCompleted(false);
        return false;
      } else {
        console.error('Error checking or creating UserCourse:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error checking or creating UserCourse:', error);
      return false;
    }
  }, [session, courseId]);

  useEffect(() => {
    if (!completedRef.current && courseId) {
      checkOrCreateUserCourse();
    }
  }, [checkOrCreateUserCourse, courseId]);

  return {isCompleted};
};

export default useTrackCourse;