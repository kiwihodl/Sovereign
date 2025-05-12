import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDecryptContent } from './useDecryptContent';

const useCourseDecryption = (session, paidCourse, course, lessons, setLessons, router, activeIndex = 0) => {
  const [decryptedLessonIds, setDecryptedLessonIds] = useState({});
  const [loading, setLoading] = useState(false);
  const { decryptContent } = useDecryptContent();
  const processingRef = useRef(false);
  const lastLessonIdRef = useRef(null);
  const retryCountRef = useRef({});
  const retryTimeoutRef = useRef(null);
  const decryptTimeoutRef = useRef(null);
  const MAX_RETRIES = 3;
  
  // Get the current active lesson using the activeIndex prop instead of router.query
  const currentLessonIndex = activeIndex;
  const currentLesson = lessons.length > 0 ? lessons[currentLessonIndex] : null;
  const currentLessonId = currentLesson?.id;
  
  // Check if the current lesson has been decrypted
  const isCurrentLessonDecrypted = 
    !paidCourse || 
    (currentLessonId && decryptedLessonIds[currentLessonId]);
  
  // Check user access
  const hasAccess = useMemo(() => {
    if (!session?.user || !paidCourse || !course) return false;
    
    return (
      session.user.purchased?.some(purchase => purchase.courseId === course?.d) ||
      session.user?.role?.subscribed ||
      session.user?.pubkey === course?.pubkey
    );
  }, [session, paidCourse, course]);
  
  // Reset retry count when lesson changes
  useEffect(() => {
    if (currentLessonId && lastLessonIdRef.current !== currentLessonId) {
      retryCountRef.current[currentLessonId] = 0;
      lastLessonIdRef.current = currentLessonId;
    }
  }, [currentLessonId, activeIndex]);
  
  // Simplified decrypt function
  const decryptCurrentLesson = useCallback(async () => {
    if (!currentLesson || !hasAccess || !paidCourse) return;
    if (processingRef.current) return;
    if (decryptedLessonIds[currentLesson.id]) return;
    if (!currentLesson.content) return;
    
    // Check retry count
    if (!retryCountRef.current[currentLesson.id]) {
      retryCountRef.current[currentLesson.id] = 0;
    }
    
    // Limit maximum retries
    if (retryCountRef.current[currentLesson.id] >= MAX_RETRIES) {
      return;
    }
    
    // Increment retry count
    retryCountRef.current[currentLesson.id]++;
    
    try {
      processingRef.current = true;
      setLoading(true);
      
      // Start the decryption process
      const decryptionPromise = decryptContent(currentLesson.content);
      
      // Add safety timeout to prevent infinite processing
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          if (decryptionPromise.cancel) {
            decryptionPromise.cancel();
          }
          reject(new Error('Decryption timeout'));
        }, 10000);
        decryptTimeoutRef.current = timeoutId;
      });
      
      // Use a separate try-catch for the race
      let decryptedContent;
      try {
        // Race between decryption and timeout
        decryptedContent = await Promise.race([
          decryptionPromise,
          timeoutPromise
        ]);
        
        // Clear the timeout if decryption wins
        clearTimeout(timeoutId);
        decryptTimeoutRef.current = null;
      } catch (error) {
        clearTimeout(timeoutId);
        // If timeout or network error, schedule a retry
        retryTimeoutRef.current = setTimeout(() => {
          processingRef.current = false;
          decryptCurrentLesson();
        }, 5000);
        throw error;
      }
      
      if (!decryptedContent) {
        return;
      }
      
      // Update the lessons array with decrypted content
      const updatedLessons = lessons.map(lesson => 
        lesson.id === currentLesson.id 
          ? { ...lesson, content: decryptedContent } 
          : lesson
      );
      
      setLessons(updatedLessons);
      
      // Mark this lesson as decrypted
      setDecryptedLessonIds(prev => ({
        ...prev,
        [currentLesson.id]: true
      }));
      
      // Reset retry counter on success
      retryCountRef.current[currentLesson.id] = 0;
    } catch (error) {
      // Silent error handling to prevent UI disruption
      console.error('Decryption error:', error);
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  }, [currentLesson, hasAccess, paidCourse, decryptContent, lessons, setLessons, decryptedLessonIds]);
  
  // Run decryption when lesson changes
  useEffect(() => {
    if (!currentLessonId) return;
    
    // Always attempt decryption when activeIndex changes
    if (hasAccess && paidCourse && !decryptedLessonIds[currentLessonId]) {
      decryptCurrentLesson();
    }
  }, [currentLessonId, hasAccess, paidCourse, decryptedLessonIds, decryptCurrentLesson, activeIndex]);
  
  useEffect(() => {
    return () => {
      if (decryptTimeoutRef.current) {
        clearTimeout(decryptTimeoutRef.current);
        decryptTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);
  
  return {
    decryptionPerformed: isCurrentLessonDecrypted,
    loading,
    decryptedLessonIds
  };
};

export default useCourseDecryption;
