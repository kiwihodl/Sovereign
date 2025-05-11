import { useCallback, useMemo } from 'react';
import { useToast } from '../useToast';
import { useSession } from 'next-auth/react';

/**
 * Hook to handle course payment processing and authorization
 * @param {Object} course - The course object
 * @returns {Object} Payment handling utilities and authorization state
 */
const useCoursePayment = (course) => {
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  
  // Determine if course requires payment
  const isPaidCourse = useMemo(() => {
    return course?.price && course.price > 0;
  }, [course]);
  
  // Check if user is authorized to access the course
  const isAuthorized = useMemo(() => {
    if (!session?.user || !course) return !isPaidCourse; // Free courses are always authorized
    
    return (
      // User is subscribed
      session.user.role?.subscribed ||
      // User is the creator of the course
      session.user.pubkey === course.pubkey ||
      // Course is free
      !isPaidCourse ||
      // User has purchased this specific course
      session.user.purchased?.some(purchase => purchase.courseId === course.d)
    );
  }, [session, course, isPaidCourse]);
  
  // Handler for successful payment
  const handlePaymentSuccess = useCallback(async (response) => {
    if (response && response?.preimage) {
      // Update session to reflect purchase
      const updated = await update();
      showToast('success', 'Payment Success', 'You have successfully purchased this course');
      return true;
    } else {
      showToast('error', 'Error', 'Failed to purchase course. Please try again.');
      return false;
    }
  }, [update, showToast]);
  
  // Handler for payment errors
  const handlePaymentError = useCallback((error) => {
    showToast(
      'error',
      'Payment Error',
      `Failed to purchase course. Please try again. Error: ${error}`
    );
    return false;
  }, [showToast]);
  
  return {
    isPaidCourse,
    isAuthorized,
    handlePaymentSuccess,
    handlePaymentError,
    session
  };
};

export default useCoursePayment; 