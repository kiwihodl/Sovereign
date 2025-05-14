# Yearly Subscription Implementation Plan

## 1. Database Schema Updates

```prisma
model Role {
    // Existing fields...
    subscriptionType  String    @default("monthly") // Options: "monthly", "yearly"
    // Other fields remain the same
}
```

## 2. UI Component Updates

### SubscribeModal.js
- Add toggle between monthly/yearly subscription options
- Update pricing display (50,000 sats monthly / 500,000 sats yearly)
- Show savings message for yearly option (~17% discount)

### SubscriptionPaymentButton.js
- Add subscription type parameter
- Modify amount calculation based on subscription type
- Update NWC configuration for yearly budgets

```javascript
// Example modification
const getAmount = (subscriptionType) => {
  return subscriptionType === 'yearly' ? 500000 : 50000;
};

// For NWC setup
const budgetRenewal = subscriptionType === 'yearly' ? 'yearly' : 'monthly';
```

## 3. API Endpoints Updates

### /api/users/subscription
- Update to accept subscriptionType parameter
- Modify database update to store subscription type

```javascript
// Example modification
export const updateUserSubscription = async (userId, isSubscribed, nwc, subscriptionType = 'monthly') => {
  try {
    const now = new Date();
    return await prisma.user.update({
      where: { id: userId },
      data: {
        role: {
          upsert: {
            create: {
              subscribed: isSubscribed,
              subscriptionType: subscriptionType,
              // Other fields remain the same
            },
            update: {
              subscribed: isSubscribed,
              subscriptionType: subscriptionType,
              // Other fields remain the same
            },
          },
        },
      },
      include: {
        role: true,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
};
```

## 4. Cron Job Modifications

### cron.js
- Update expiration calculation to check subscription type
- For monthly: expire after 30 days + 1 hour
- For yearly: expire after 365 days + 1 hour

```javascript
export const findExpiredSubscriptions = async () => {
  const now = new Date();
  
  // Define expiration periods
  const monthlyExpiration = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000);
  const yearlyExpiration = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000);
  
  // Find expired subscriptions of both types
  const expiredSubscriptions = await prisma.role.findMany({
    where: {
      subscribed: true,
      OR: [
        {
          subscriptionType: 'monthly',
          lastPaymentAt: { lt: monthlyExpiration }
        },
        {
          subscriptionType: 'yearly', 
          lastPaymentAt: { lt: yearlyExpiration }
        }
      ]
    },
    select: {
      userId: true,
      nwc: true,
      subscriptionType: true,
      subscriptionExpiredAt: true,
      subscriptionStartDate: true,
      admin: true,
    }
  });
  
  return expiredSubscriptions;
};
```

## 5. Testing Plan

### Database Testing
1. Verify Prisma schema correctly includes the subscriptionType field with default value "monthly"
2. Confirm migrations apply correctly to existing database

### UI Testing
1. **Monthly Subscription UI**
   - Verify the subscription selector defaults to monthly
   - Check pricing shows 50,000 sats for monthly
   - Ensure subscription buttons show "Monthly" where appropriate

2. **Yearly Subscription UI**
   - Verify selecting yearly plan updates all UI elements
   - Check pricing shows 500,000 sats for yearly
   - Confirm ~17% savings message appears
   - Ensure subscription buttons show "Yearly" where appropriate

### Payment Flow Testing
1. **Monthly One-time Payment**
   - Test subscription purchase with "Pay as you go" for monthly plan
   - Verify subscription is created with type "monthly"
   - Confirm user profile shows correct subscription expiration date (30 days)

2. **Monthly Recurring Payment**
   - Test subscription setup with "Setup Recurring Monthly Subscription"
   - Verify NWC configuration with monthly budget renewal
   - Confirm subscription is created with type "monthly"

3. **Yearly One-time Payment**
   - Test subscription purchase with "Pay as you go" for yearly plan
   - Verify subscription is created with type "yearly"
   - Confirm user profile shows correct subscription expiration date (365 days)

4. **Yearly Recurring Payment**
   - Test subscription setup with "Setup Recurring Yearly Subscription"
   - Verify NWC configuration with yearly budget renewal
   - Confirm subscription is created with type "yearly"

### Cron Job Testing
1. **Recently Active Monthly Subscription**
   - Set up test account with monthly subscription
   - Verify subscription not marked as expired by cron job

2. **Recently Active Yearly Subscription**
   - Set up test account with yearly subscription
   - Verify subscription not marked as expired by cron job

3. **Expired Monthly Subscription**
   - Create test account with monthly subscription
   - Manually adjust lastPaymentAt date to be >30 days ago
   - Run cron job and verify subscription is expired

4. **Expired Yearly Subscription**
   - Create test account with yearly subscription
   - Manually adjust lastPaymentAt date to be >365 days ago
   - Run cron job and verify subscription is expired

5. **Auto-renewal Testing**
   - Set up NWC for test accounts (both monthly and yearly)
   - Manually adjust lastPaymentAt date to trigger expiration
   - Run cron job and verify proper renewal amount is charged
   - Confirm subscription type is maintained after renewal

## 6. Implementation Steps

1. ✅ Create database migration for schema changes
2. ✅ Modify frontend subscription components
3. ✅ Update backend models and API endpoints
4. ✅ Update cron job logic
5. Test all flows thoroughly
6. Deploy changes

## 7. Marketing Considerations

- Highlight savings with yearly subscription (~17% discount)
- Update documentation and marketing materials
- Consider grandfathering existing subscribers or offering upgrade path
