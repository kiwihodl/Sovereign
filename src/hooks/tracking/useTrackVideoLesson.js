import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const useTrackVideoLesson = ({lessonId, videoDuration, courseId, videoPlayed}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const timerRef = useRef(null);
  const { data: session } = useSession();
  const completedRef = useRef(false);

  // Check if the lesson is already completed or create a new UserLesson record
  const checkOrCreateUserLesson = useCallback(async () => {
    if (!session?.user) return false;
    try {
      const response = await axios.get(`/api/users/${session.user.id}/lessons/${lessonId}?courseId=${courseId}`);
      if (response.status === 200 && response?.data) {
        // Case 1: UserLesson record exists
        if (response?.data?.completed) {
          // Lesson is already completed
          setIsCompleted(true);
          completedRef.current = true;
          return true;
        } else {
          // Lesson exists but is not completed
          return false;
        }
      } else if (response.status === 204) {
        // Case 2: UserLesson record doesn't exist, create a new one
        await axios.post(`/api/users/${session.user.id}/lessons?courseId=${courseId}`, {
          // currently the only id we get is the resource id which associates to the lesson
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
  }, [session, lessonId]);

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
  }, [lessonId, session]);

  useEffect(() => {
    const initializeTracking = async () => {
      const alreadyCompleted = await checkOrCreateUserLesson();
      // Case 3: Start tracking if the lesson is not completed, video duration is available, and video has been played
      if (!alreadyCompleted && videoDuration && !completedRef.current && videoPlayed) {
        console.log(`Tracking started for lesson ${lessonId}, video duration: ${videoDuration} seconds, video played: ${videoPlayed}`);
        setIsTracking(true);
        timerRef.current = setInterval(() => {
          setTimeSpent(prevTime => prevTime + 1);
        }, 1000);
      }
    };

    initializeTracking();

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lessonId, videoDuration, checkOrCreateUserLesson, videoPlayed]);

  useEffect(() => {
    // Case 4: Mark lesson as completed when 90% of the video is watched
    if (videoDuration && timeSpent >= Math.round(videoDuration * 0.9) && !completedRef.current) {
      markLessonAsCompleted();
    }
  }, [timeSpent, videoDuration, markLessonAsCompleted]);

  return { isCompleted, isTracking };
};

export default useTrackVideoLesson;
