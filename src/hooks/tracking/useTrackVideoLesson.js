import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const useTrackVideoLesson = ({lessonId, videoDuration, courseId, videoPlayed, paidCourse, decryptionPerformed}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const timerRef = useRef(null);
  const { data: session, update } = useSession();
  const completedRef = useRef(false);

  useEffect(() => {
    if (session?.user?.role?.admin) {
      setIsAdmin(true);
    }
  }, [session]);

  const checkOrCreateUserLesson = useCallback(async () => {
    if (!session?.user) {
      console.log('📝 [useTrackVideoLesson] No user session found');
      return false;
    }
    try {
      console.log('📝 [useTrackVideoLesson] Checking lesson status:', { lessonId, courseId });
      const response = await axios.get(`/api/users/${session.user.id}/lessons/${lessonId}?courseId=${courseId}`);
      
      if (response.status === 200 && response?.data) {
        console.log('📝 [useTrackVideoLesson] Existing lesson found:', response.data);
        if (response?.data?.completed) {
          console.log('✅ [useTrackVideoLesson] Lesson already completed');
          setIsCompleted(true);
          completedRef.current = true;
          return true;
        }
        return false;
      } else if (response.status === 204) {
        console.log('📝 [useTrackVideoLesson] No existing lesson found, checking if should create:', {
          paidCourse,
          decryptionPerformed
        });
        
        if (paidCourse === false || (paidCourse && decryptionPerformed)) {
          console.log('📝 [useTrackVideoLesson] Creating new lesson entry');
          await axios.post(`/api/users/${session.user.id}/lessons?courseId=${courseId}`, {
            resourceId: lessonId,
            opened: true,
            openedAt: new Date().toISOString(),
          });
          console.log('✨ [useTrackVideoLesson] New lesson entry created');
          await update();
        }
        return false;
      }
    } catch (error) {
      console.error('❌ [useTrackVideoLesson] Error in checkOrCreateUserLesson:', error);
      return false;
    }
  }, [session, lessonId, courseId, update, paidCourse, decryptionPerformed]);

  const markLessonAsCompleted = useCallback(async () => {
    if (!session?.user || completedRef.current) {
      console.log('📝 [useTrackVideoLesson] Skipping completion:', { 
        hasUser: !!session?.user, 
        alreadyCompleted: completedRef.current 
      });
      return;
    }
    
    console.log('📝 [useTrackVideoLesson] Marking lesson as completed:', { lessonId, courseId });
    completedRef.current = true;
    
    try {
      const response = await axios.put(`/api/users/${session.user.id}/lessons/${lessonId}?courseId=${courseId}`, {
        completed: true,
        completedAt: new Date().toISOString(),
      });

      if (response.status === 200) {
        setIsCompleted(true);
        setIsTracking(false);
        console.log('✅ [useTrackVideoLesson] Lesson marked as completed successfully');
        await update();
      } else {
        console.error('Failed to mark lesson as completed:', response.statusText);
      }
    } catch (error) {
      console.error('❌ [useTrackVideoLesson] Error marking lesson as completed:', error);
    }
  }, [lessonId, courseId, session, update]);

  useEffect(() => {
    const initializeTracking = async () => {
      if (isAdmin) {
        console.log('👑 [useTrackVideoLesson] Admin user - skipping tracking');
        return;
      }

      console.log('📝 [useTrackVideoLesson] Initializing tracking:', {
        videoDuration,
        videoPlayed,
        paidCourse,
        decryptionPerformed
      });
      
      const alreadyCompleted = await checkOrCreateUserLesson();
      if (!alreadyCompleted && videoDuration && !completedRef.current && videoPlayed && (!paidCourse || (paidCourse && decryptionPerformed))) {
        setIsTracking(true);
        timerRef.current = setInterval(() => {
          setTimeSpent(prevTime => {
            const newTime = prevTime + 1;
            return newTime;
          });
        }, 1000);
      }
    };

    initializeTracking();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lessonId, videoDuration, checkOrCreateUserLesson, videoPlayed, isAdmin, paidCourse, decryptionPerformed]);

  useEffect(() => {
    if (isAdmin) return;

    if (videoDuration && timeSpent >= Math.round(videoDuration * 0.8) && !completedRef.current) {
      console.log('🎯 Video reached 80% threshold - Marking as completed');
      markLessonAsCompleted();
    }
  }, [timeSpent, videoDuration, markLessonAsCompleted, isAdmin]);

  return { isCompleted, isTracking };
};

export default useTrackVideoLesson;