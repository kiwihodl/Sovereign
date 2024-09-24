import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useSession} from 'next-auth/react';
import axios from 'axios';

const useTrackCourse = ({courseId, paidCourse, decryptionPerformed}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const {data: session, update} = useSession();
  const completedRef = useRef(false);

  const checkOrCreateUserCourse = useCallback(async () => {
    if (!session?.user || !courseId) return false;
    try {
      const response = await axios.get(`/api/users/${session.user.id}/courses/${courseId}`);
      // fix this condition?
      if (response.status === 200 && response?.data) {
        setIsCompleted(true);
        completedRef.current = true;
      } else if (response.status === 204) {
        // Only create a new UserCourse entry if it's a free course or if decryption has been performed for a paid course
        console.log("about to create new UserCourse entry", paidCourse, decryptionPerformed);
        if (paidCourse === false || (paidCourse && decryptionPerformed)) {
          console.log("creating new UserCourse entry");
          await axios.post(`/api/users/${session.user.id}/courses?courseSlug=${courseId}`, {
            completed: false,
            started: true,
            startedAt: new Date().toISOString(),
          });
          // Call session update after creating a new UserCourse entry
          await update();
        }

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
  }, [courseId, paidCourse, decryptionPerformed]);

  useEffect(() => {
    if (!completedRef.current && courseId && session?.user) {
      checkOrCreateUserCourse();
    }
  }, [courseId]);

  return {isCompleted};
};

export default useTrackCourse;