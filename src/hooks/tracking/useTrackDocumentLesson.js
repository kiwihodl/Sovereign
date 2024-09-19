import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const useTrackDocumentLesson = ({ lessonId, courseId, readTime }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const timerRef = useRef(null);
  const { data: session } = useSession();
  const completedRef = useRef(false);

  useEffect(() => {
    if (session?.user?.role?.admin) {
      setIsAdmin(true);
      setIsCompleted(true); // Automatically mark as completed for admins
    }
  }, [session]);

  const checkOrCreateUserLesson = useCallback(async () => {
    if (!session?.user) return false;
    try {
      const response = await axios.get(`/api/users/${session.user.id}/lessons/${lessonId}?courseId=${courseId}`);
      if (response.status === 200 && response?.data) {
        if (response?.data?.completed) {
          setIsCompleted(true);
          completedRef.current = true;
          return true;
        } else {
          return false;
        }
      } else if (response.status === 204) {
        await axios.post(`/api/users/${session.user.id}/lessons?courseId=${courseId}`, {
          resourceId: lessonId,
          opened: true,
          openedAt: new Date().toISOString(),
        });
        return false;
      } else {
        console.error('Error checking or creating UserLesson:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error checking or creating UserLesson:', error);
      return false;
    }
  }, [session, lessonId, courseId]);

  const markLessonAsCompleted = useCallback(async () => {
    if (!session?.user || completedRef.current) return;
    completedRef.current = true;
    
    try {
      const response = await axios.put(`/api/users/${session.user.id}/lessons/${lessonId}?courseId=${courseId}`, {
        completed: true,
        completedAt: new Date().toISOString(),
      });

      if (response.status === 200) {
        setIsCompleted(true);
        setIsTracking(false);
      } else {
        console.error('Failed to mark lesson as completed:', response.statusText);
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  }, [lessonId, courseId, session]);

  useEffect(() => {
    const initializeTracking = async () => {
      if (isAdmin) return; // Skip tracking for admin users

      const alreadyCompleted = await checkOrCreateUserLesson();
      if (!alreadyCompleted && !completedRef.current) {
        setIsTracking(true);
        timerRef.current = setInterval(() => {
          setTimeSpent(prevTime => prevTime + 1);
        }, 1000);
      }
    };

    initializeTracking();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lessonId, checkOrCreateUserLesson, isAdmin]);

  useEffect(() => {
    if (isAdmin) return; // Skip tracking for admin users

    // Mark lesson as completed after readTime seconds
    if (timeSpent >= readTime && !completedRef.current) {
      markLessonAsCompleted();
    }
  }, [timeSpent, markLessonAsCompleted, readTime, isAdmin]);

  return { isCompleted, isTracking };
};

export default useTrackDocumentLesson;