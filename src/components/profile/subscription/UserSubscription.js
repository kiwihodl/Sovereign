import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { Card } from 'primereact/card';
import useWindowWidth from '@/hooks/useWindowWidth';
import SubscribeModal from '@/components/profile/subscription/SubscribeModal';
import { ProgressSpinner } from 'primereact/progressspinner';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';
import UserProfileCard from '@/components/profile/UserProfileCard';
import Image from 'next/image';
import NostrIcon from '../../../../public/images/nostr.png';
import GenericButton from '@/components/buttons/GenericButton';
import CancelSubscription from '@/components/profile/subscription/CancelSubscription';
import CalendlyEmbed from '@/components/profile/subscription/CalendlyEmbed';
import Nip05Form from '@/components/profile/subscription/Nip05Form';
import LightningAddressForm from '@/components/profile/subscription/LightningAddressForm';
import RenewSubscription from '@/components/profile/subscription/RenewSubscription';
import { SelectButton } from 'primereact/selectbutton';
import { SUBSCRIPTION_PERIODS, calculateExpirationDate } from '@/constants/subscriptionPeriods';

const UserSubscription = () => {
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  const windowWidth = useWindowWidth();
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribedUntil, setSubscribedUntil] = useState(null);
  const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState(null);
  const [subscribeModalVisible, setSubscribeModalVisible] = useState(false);
  const [calendlyVisible, setCalendlyVisible] = useState(false);
  const [lightningAddressVisible, setLightningAddressVisible] = useState(false);
  const [nip05Visible, setNip05Visible] = useState(false);
  const [cancelSubscriptionVisible, setCancelSubscriptionVisible] = useState(false);
  const [renewSubscriptionVisible, setRenewSubscriptionVisible] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState('monthly');

  const subscriptionOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  useEffect(() => {
    if (session && session?.user) {
      setUser(session.user);
      if (session.user.role?.subscriptionType) {
        setSubscriptionType(session.user.role.subscriptionType);
      }
    }
  }, [session]);

  useEffect(() => {
    if (user && user.role) {
      setSubscribed(user.role.subscribed);
      
      if (user.role.lastPaymentAt) {
        const subscribedAt = new Date(user.role.lastPaymentAt);
        
        // Use the common helper to calculate expiration date
        const subscribedUntil = calculateExpirationDate(subscribedAt, user.role.subscriptionType || 'monthly');
        
        setSubscribedUntil(subscribedUntil);
      } else {
        setSubscribedUntil(null);
      }
      
      if (user.role.subscriptionExpiredAt) {
        const expiredAt = new Date(user.role.subscriptionExpiredAt);
        setSubscriptionExpiredAt(expiredAt);
      }
    }
  }, [user]);

  const handleSubscriptionSuccess = async response => {
    setIsProcessing(true);
    try {
      const apiResponse = await axios.put('/api/users/subscription', {
        userId: session.user.id,
        isSubscribed: true,
        subscriptionType: subscriptionType,
      });
      if (apiResponse.data) {
        await update();
        showToast('success', 'Subscription Successful', 'Your subscription has been activated.');
      } else {
        throw new Error('Failed to update subscription status');
      }
    } catch (error) {
      console.error('Subscription update error:', error);
      showToast('error', 'Subscription Update Failed', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscriptionError = error => {
    console.error('Subscription error:', error);
    showToast('error', 'Subscription Failed', `An error occurred: ${error.message}`);
    setIsProcessing(false);
  };

  const handleRecurringSubscriptionSuccess = async () => {
    setIsProcessing(true);
    try {
      await update();
      showToast(
        'success',
        'Recurring Subscription Activated',
        'Your recurring subscription has been set up successfully.'
      );
    } catch (error) {
      console.error('Session update error:', error);
      showToast('error', 'Session Update Failed', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-4 px-1">
      {windowWidth < 768 && <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>}
      <div className="w-full flex flex-row max-lap:flex-col">
        {/* Left Column - 22% */}
        <div className="w-[21%] h-full max-lap:w-full">
          {user && (
            <>
              <UserProfileCard user={user} />
              <SubscribeModal
                visible={subscribeModalVisible}
                onHide={() => setSubscribeModalVisible(false)}
                user={user}
              />
            </>
          )}
        </div>

        {/* Right Column - 78% */}
        <div className="w-[78%] flex flex-col justify-center mx-2 max-lap:mx-0 max-lap:w-full">
          {!subscribed && (
            <Card
              title="Subscribe to PlebDevs"
              className="max-lap:h-auto border border-gray-700"
              pt={{
                body: { className: 'py-2' },
                content: { className: 'pt-0' },
              }}
            >
              {isProcessing ? (
                <div className="w-full flex flex-col mx-auto justify-center items-center mt-4">
                  <div className="w-full h-full flex items-center justify-center">
                    <ProgressSpinner />
                  </div>
                  <span className="ml-2">Processing subscription...</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="mb-4">
                    <p className="text-gray-400">
                      Subscribe now and elevate your development journey!
                    </p>
                  </div>
                  <div className="flex flex-col gap-5 mb-5">
                    <div className="flex items-center">
                      <i className="pi pi-book text-2xl text-primary mr-3 text-blue-400"></i>
                      <span>Access ALL current and future PlebDevs content</span>
                    </div>
                    <div className="flex items-center">
                      <i className="pi pi-calendar text-2xl text-primary mr-3 text-red-400"></i>
                      <span>
                        Personal mentorship & guidance and access to exclusive 1:1 booking calendar
                      </span>
                    </div>
                    <div className="flex items-center">
                      <i className="pi pi-bolt text-2xl text-primary mr-3 text-yellow-500"></i>
                      <span>Claim your own personal plebdevs.com Lightning Address</span>
                    </div>
                    <div className="flex items-center">
                      <Image src={NostrIcon} alt="Nostr" width={25} height={25} className="mr-3" />
                      <span>Claim your own personal plebdevs.com Nostr NIP-05 identity</span>
                    </div>
                  </div>
                  
                  <div className="subscription-plan-selector my-6">
                    <div className="flex flex-col items-center mb-4">
                      <h3 className="text-xl font-bold mb-3">Select Your Plan</h3>
                      <SelectButton 
                        value={subscriptionType} 
                        options={subscriptionOptions} 
                        onChange={(e) => {
                          if (e.value !== subscriptionType) {
                            setSubscriptionType(e.value)
                          }
                        }} 
                        className="mb-3 w-full max-w-[300px] mx-auto"
                        pt={{
                          button: { className: 'text-base px-8 py-2 text-white' },
                          root: { className: 'flex justify-center' }
                        }}
                      />
                      {subscriptionType === 'yearly' && (
                        <div className="savings-message text-sm text-green-500 font-semibold mt-2">
                          Save ~17% with yearly subscription!
                        </div>
                      )}
                      <div className="price-display text-2xl font-bold mt-3">
                        {subscriptionType === 'yearly' ? '500,000' : '50,000'} sats
                        <span className="text-sm text-gray-400 ml-2">
                          ({subscriptionType === 'yearly' ? 'yearly' : 'monthly'})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <SubscriptionPaymentButtons
                    onSuccess={handleSubscriptionSuccess}
                    onRecurringSubscriptionSuccess={handleRecurringSubscriptionSuccess}
                    onError={handleSubscriptionError}
                    setIsProcessing={setIsProcessing}
                    layout={windowWidth < 768 ? 'col' : 'row'}
                    subscriptionType={subscriptionType}
                  />
                </div>
              )}
            </Card>
          )}

          {subscribed && (
            <>
              <Card
                title="Subscription Benefits"
                className="h-[330px] border border-gray-700 rounded-lg"
                pt={{
                  content: { className: 'py-0' },
                }}
              >
                {isProcessing ? (
                  <div className="w-full flex flex-col mx-auto justify-center items-center mt-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <ProgressSpinner />
                    </div>
                    <span className="ml-2">Processing subscription...</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="mb-1">
                      <p className="text-gray-300 mb-1">
                        <span className="font-semibold">Current Plan:</span> {user?.role?.subscriptionType || 'monthly'} subscription
                      </p>
                      <p className="text-gray-300">
                        <span className="font-semibold">Renews on:</span> {subscribedUntil ? subscribedUntil.toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <GenericButton
                        severity="info"
                        outlined
                        className="w-fit text-start"
                        label="Schedule 1:1"
                        icon="pi pi-calendar"
                        onClick={() => setCalendlyVisible(true)}
                      />
                      <GenericButton
                        severity="help"
                        outlined
                        className="w-fit text-start"
                        label={
                          user?.platformNip05?.name
                            ? 'Update Nostr NIP-05'
                            : 'Claim PlebDevs Nostr NIP-05'
                        }
                        icon="pi pi-at"
                        onClick={() => setNip05Visible(true)}
                      />
                      <GenericButton
                        severity="warning"
                        outlined
                        className="w-fit text-start"
                        label={
                          user?.platformLightningAddress
                            ? 'Update Lightning Address'
                            : 'Claim PlebDevs Lightning Address'
                        }
                        icon={<i style={{ color: 'orange' }} className="pi pi-bolt mr-2"></i>}
                        onClick={() => setLightningAddressVisible(true)}
                      />
                    </div>
                  </div>
                )}
              </Card>
              <Card title="Manage Subscription" className="mt-2 border border-gray-700 rounded-lg">
                <div className="flex flex-col gap-4">
                  <GenericButton
                    outlined
                    className="w-fit"
                    label="Renew Subscription"
                    icon="pi pi-sync"
                    onClick={() => setRenewSubscriptionVisible(true)}
                  />
                  <GenericButton
                    severity="danger"
                    outlined
                    className="w-fit"
                    label="Cancel Subscription"
                    icon="pi pi-trash"
                    onClick={() => setCancelSubscriptionVisible(true)}
                  />
                </div>
              </Card>
            </>
          )}

          <Card
            title="Frequently Asked Questions"
            className="mt-2 border border-gray-700 rounded-lg"
          >
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-semibold">How does the subscription work?</h3>
                <p>
                  Think of the subscriptions as a paetreon type model. You pay a monthly or yearly fee and in
                  return you get access to premium features and all of the paid content. You can
                  cancel at any time.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">What&apos;s the difference between monthly and yearly?</h3>
                <p>
                  The yearly subscription offers a ~17% discount compared to paying monthly for a year.
                  Both plans give you the same access to all features and content.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">How do I Subscribe? (Pay as you go)</h3>
                <p>
                  The pay as you go subscription is a one-time payment that gives you access to all
                  of the premium features for one month or year, depending on your selected plan. You will need to manually renew your
                  subscription when it expires.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">How do I Subscribe? (Recurring)</h3>
                <p>
                  The recurring subscription option allows you to submit a Nostr Wallet Connect URI
                  that will be used to automatically send the subscription fee on your chosen schedule. You can
                  cancel at any time.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Can I cancel my subscription?</h3>
                <p>
                  Yes, you can cancel your subscription at any time. Your access will remain active
                  until the end of the current billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  What happens if I don&apos;t renew my subscription?
                </h3>
                <p>
                  If you don&apos;t renew your subscription, your access to 1:1 calendar and paid
                  content will be removed. However, you will still have access to your plebdevs
                  Lightning Address, NIP-05, and any content that you paid for.
                </p>
              </div>
              {/* Add more FAQ items as needed */}
            </div>
          </Card>
        </div>
      </div>

      <CalendlyEmbed
        visible={calendlyVisible}
        onHide={() => setCalendlyVisible(false)}
        userId={session?.user?.id}
        userName={session?.user?.username || user?.kind0?.username}
        userEmail={session?.user?.email}
      />
      <CancelSubscription
        visible={cancelSubscriptionVisible}
        onHide={() => setCancelSubscriptionVisible(false)}
      />
      <RenewSubscription
        visible={renewSubscriptionVisible}
        onHide={() => setRenewSubscriptionVisible(false)}
        subscribedUntil={subscribedUntil}
      />
      <Nip05Form visible={nip05Visible} onHide={() => setNip05Visible(false)} />
      <LightningAddressForm
        visible={lightningAddressVisible}
        onHide={() => setLightningAddressVisible(false)}
      />
    </div>
  );
};

export default UserSubscription;
