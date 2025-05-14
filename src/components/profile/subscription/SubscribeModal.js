import React, { useState, useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { ProgressSpinner } from 'primereact/progressspinner';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { Card } from 'primereact/card';
import GenericButton from '@/components/buttons/GenericButton';
import { Menu } from 'primereact/menu';
import { Message } from 'primereact/message';
import CancelSubscription from '@/components/profile/subscription/CancelSubscription';
import CalendlyEmbed from '@/components/profile/subscription/CalendlyEmbed';
import Nip05Form from '@/components/profile/subscription/Nip05Form';
import LightningAddressForm from '@/components/profile/subscription/LightningAddressForm';
import NostrIcon from '../../../../public/images/nostr.png';
import Image from 'next/image';
import RenewSubscription from '@/components/profile/subscription/RenewSubscription';
import { SelectButton } from 'primereact/selectbutton';

const SubscribeModal = ({ user }) => {
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const menu = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribedUntil, setSubscribedUntil] = useState(null);
  const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState(null);
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
    if (user && user.role) {
      setSubscribed(user.role.subscribed);
      setSubscriptionType(user.role.subscriptionType || 'monthly');
      const subscribedAt = new Date(user.role.lastPaymentAt);
      
      // Calculate subscription end date based on type
      const daysToAdd = subscriptionType === 'yearly' ? 365 : 31;
      const subscribedUntil = new Date(subscribedAt.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      
      setSubscribedUntil(subscribedUntil);
      if (user.role.subscriptionExpiredAt) {
        const expiredAt = new Date(user.role.subscriptionExpiredAt);
        setSubscriptionExpiredAt(expiredAt);
      }
    }
  }, [user, subscriptionType]);

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
        onHide();
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
      onHide();
    } catch (error) {
      console.error('Session update error:', error);
      showToast('error', 'Session Update Failed', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const onHide = () => {
    setVisible(false);
    setIsProcessing(false);
  };

  const menuItems = [
    {
      label: 'Schedule 1:1',
      icon: 'pi pi-calendar',
      command: () => {
        setCalendlyVisible(true);
      },
    },
    {
      label: session?.user?.platformLightningAddress
        ? 'Update PlebDevs Lightning Address'
        : 'Claim PlebDevs Lightning Address',
      icon: 'pi pi-bolt',
      command: () => {
        setLightningAddressVisible(true);
      },
    },
    {
      label: session?.user?.platformNip05?.name
        ? 'Update PlebDevs Nostr NIP-05'
        : 'Claim PlebDevs Nostr NIP-05',
      icon: 'pi pi-at',
      command: () => {
        setNip05Visible(true);
      },
    },
    {
      label: 'Renew Subscription',
      icon: 'pi pi-sync',
      command: () => {
        setRenewSubscriptionVisible(true);
      },
    },
    {
      label: 'Cancel Subscription',
      icon: 'pi pi-trash',
      command: () => {
        setCancelSubscriptionVisible(true);
      },
    },
  ];

  const subscriptionCardTitle = (
    <div className="w-full flex flex-row justify-between items-center">
      <span className="text-xl text-900 font-bold text-white">Plebdevs Subscription</span>
      {subscribed && (
        <i
          className="pi pi-ellipsis-h text-2xl cursor-pointer hover:opacity-75"
          onClick={e => menu.current.toggle(e)}
        ></i>
      )}
      <Menu model={menuItems} popup ref={menu} className="w-fit" />
    </div>
  );

  return (
    <>
      <Card title={subscriptionCardTitle} className="w-full m-2 mx-auto border border-gray-700">
        {subscribed && !user?.role?.nwc && (
          <div className="flex flex-col">
            <Message className="w-fit" severity="success" text="Subscribed!" />
            <p className="mt-3">Thank you for your support 🎉</p>
            <p className="text-sm text-gray-400">
              Pay-as-you-go {user?.role?.subscriptionType || 'monthly'} subscription will renew on {subscribedUntil?.toLocaleDateString()}
            </p>
          </div>
        )}
        {subscribed && user?.role?.nwc && (
          <div className="flex flex-col">
            <Message className="w-fit" severity="success" text="Subscribed!" />
            <p className="mt-3">Thank you for your support 🎉</p>
            <p className="text-sm text-gray-400">
              Recurring {user?.role?.subscriptionType || 'monthly'} subscription will AUTO renew on {subscribedUntil?.toLocaleDateString()}
            </p>
          </div>
        )}
        {!subscribed && !subscriptionExpiredAt && (
          <div className="flex flex-col">
            <Message
              className="w-fit"
              severity="info"
              text="You currently have no active subscription"
            />
            <GenericButton
              label="Subscribe"
              className="w-auto mt-3 text-[#f8f8ff]"
              onClick={() => setVisible(true)}
            />
          </div>
        )}
        {subscriptionExpiredAt && (
          <div className="flex flex-col">
            <Message
              className="w-fit"
              severity="warn"
              text={`Your subscription expired on ${subscriptionExpiredAt.toLocaleDateString()}`}
            />
            <GenericButton
              label="Subscribe"
              className="w-auto mt-4 text-[#f8f8ff]"
              onClick={() => setVisible(true)}
            />
          </div>
        )}
      </Card>
      <Modal
        header="Subscribe to PlebDevs"
        visible={visible}
        onHide={onHide}
      >
        {isProcessing ? (
          <div className="w-full flex flex-col mx-auto justify-center items-center mt-4">
            <div className="w-full h-full flex items-center justify-center">
              <ProgressSpinner />
            </div>
            <span className="ml-2">Processing subscription...</span>
          </div>
        ) : (
          <Card className="shadow-none">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">Unlock Premium Benefits</h2>
              <p className="text-gray-400">Subscribe now and elevate your development journey!</p>
            </div>
            <div className="flex flex-col gap-6 mb-6 w-[75%] mx-auto">
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
                <Image src={NostrIcon} alt="Nostr" width={26} height={26} className="mr-3" />
                <span>Claim your own personal plebdevs.com Nostr NIP-05 identity</span>
              </div>
            </div>
            
            <div className="subscription-plan-selector my-8">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-xl font-bold mb-4">Select Your Plan</h3>
                <SelectButton 
                  value={subscriptionType} 
                  options={subscriptionOptions} 
                  onChange={(e) => setSubscriptionType(e.value)} 
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
            
            <div className="mt-6">
              <SubscriptionPaymentButtons
                onSuccess={handleSubscriptionSuccess}
                onRecurringSubscriptionSuccess={handleRecurringSubscriptionSuccess}
                onError={handleSubscriptionError}
                setIsProcessing={setIsProcessing}
                subscriptionType={subscriptionType}
                layout="col"
              />
            </div>
          </Card>
        )}
      </Modal>
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
    </>
  );
};

export default SubscribeModal;
