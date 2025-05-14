// Constants for subscription periods to maintain consistency across the application
export const SUBSCRIPTION_PERIODS = {
  MONTHLY: {
    DAYS: 30,
    BUFFER_HOURS: 1, // Buffer time for expiration checks
  },
  YEARLY: {
    DAYS: 365,
    BUFFER_HOURS: 1, // Buffer time for expiration checks
  }
};

// Helper to calculate expiration date (for UI display)
export const calculateExpirationDate = (startDate, subscriptionType) => {
  const periodDays = subscriptionType === 'yearly' 
    ? SUBSCRIPTION_PERIODS.YEARLY.DAYS 
    : SUBSCRIPTION_PERIODS.MONTHLY.DAYS;
  
  return new Date(startDate.getTime() + periodDays * 24 * 60 * 60 * 1000);
};

// Helper to check if subscription has expired (for backend logic)
export const hasSubscriptionExpired = (lastPaymentDate, subscriptionType) => {
  if (!lastPaymentDate) return true;
  
  const now = new Date();
  const period = subscriptionType === 'yearly' 
    ? SUBSCRIPTION_PERIODS.YEARLY 
    : SUBSCRIPTION_PERIODS.MONTHLY;
  
  const expirationTime = lastPaymentDate.getTime() + 
    (period.DAYS * 24 * 60 * 60 * 1000) + 
    (period.BUFFER_HOURS * 60 * 60 * 1000);
  
  return now.getTime() > expirationTime;
}; 