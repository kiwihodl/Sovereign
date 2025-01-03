import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useSession} from 'next-auth/react';
import axios from 'axios';

const useTrackCourse = ({courseId, paidCourse, decryptionPerformed}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const {data: session, update} = useSession();
  const completedRef = useRef(false);

  const checkOrCreateUserCourse = useCallback(async () => {
    if (!session?.user || !courseId) {
      console.log('📝 [useTrackCourse] Missing required data:', { 
        hasUser: !!session?.user, 
        courseId 
      });
      return false;
    }
    
    try {
      console.log('📝 [useTrackCourse] Checking course status:', { courseId });
      const response = await axios.get(`/api/users/${session.user.id}/courses/${courseId}`);
      
      if (response.status === 200 && response?.data) {
        console.log('✅ [useTrackCourse] Course already exists:', response.data);
        setIsCompleted(true);
        completedRef.current = true;
      } else if (response.status === 204) {
        console.log('📝 [useTrackCourse] No existing course found, checking if should create:', {
          paidCourse,
          decryptionPerformed
        });
        
        if (paidCourse === false || (paidCourse && decryptionPerformed)) {
          console.log('📝 [useTrackCourse] Creating new course entry');
          await axios.post(`/api/users/${session.user.id}/courses?courseSlug=${courseId}`, {
            completed: false,
            started: true,
            startedAt: new Date().toISOString(),
          });
          console.log('✨ [useTrackCourse] New course entry created');
          await update();
        }
        setIsCompleted(false);
        return false;
      }
    } catch (error) {
      console.error('❌ [useTrackCourse] Error in checkOrCreateUserCourse:', error);
      return false;
    }
  }, [courseId, paidCourse, decryptionPerformed]);

  useEffect(() => {
    if (!completedRef.current && courseId && session?.user) {
      console.log('📝 [useTrackCourse] Initializing course tracking:', { 
        courseId,
        userId: session?.user?.id 
      });
      checkOrCreateUserCourse();
    }
  }, [courseId]);

  return {isCompleted};
};

export default useTrackCourse;