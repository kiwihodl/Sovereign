import React, { useState, useEffect } from 'react';
import { track } from '@vercel/analytics';
import { initializeBitcoinConnect, getSDK } from './BitcoinConnect';
import { LightningAddress } from '@getalby/lightning-tools';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Divider } from 'primereact/divider';
import dynamic from 'next/dynamic';
import AlbyButton from '@/components/buttons/AlbyButton';
import GenericButton from '@/components/buttons/GenericButton';
import axios from 'axios';
import Image from 'next/image';

const PaymentModal = dynamic(
  () => import('@getalby/bitcoin-connect-react').then(mod => mod.Payment),
  { ssr: false }
);

const SubscriptionPaymentButtons = ({
  onSuccess,
  onError,
  onRecurringSubscriptionSuccess,
  setIsProcessing,
  oneTime = false,
  recurring = false,
  layout = 'row',
}) => {
  const [invoice, setInvoice] = useState(null);
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [nwcInput, setNwcInput] = useState('');
  const { showToast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();

  const lnAddress = process.env.NEXT_PUBLIC_LIGHTNING_ADDRESS;
  const amount = 50000;

  useEffect(() => {
    // Initialize Bitcoin Connect as early as possible
    initializeBitcoinConnect().catch(err => {
      console.error("Error initializing Bitcoin Connect:", err);
    });
  }, []);

  useEffect(() => {
    let intervalId;
    if (invoice) {
      intervalId = setInterval(async () => {
        try {
          const paid = await invoice.verifyPayment();
          if (paid && invoice.preimage) {
            clearInterval(intervalId);
            // handle success
            onSuccess();
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          clearInterval(intervalId);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [invoice, onSuccess]);

  const fetchInvoice = async () => {
    try {
      const ln = new LightningAddress(lnAddress);
      await ln.fetch();
      const newInvoice = await ln.requestInvoice({
        satoshi: amount,
        comment: `Subscription Purchase. User: ${session?.user?.id}`,
      });
      console.log("Invoice fetched successfully:", newInvoice);
      return newInvoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      showToast('error', 'Invoice Error', `Failed to fetch the invoice: ${error.message}`);
      if (onError) onError(error);
      return null;
    }
  };

  const handlePaymentSuccess = async response => {
    track('Subscription Payment', { method: 'pay_as_you_go', userId: session?.user?.id });
    showToast('success', 'Payment Successful', 'Your payment has been processed successfully.');
    if (onSuccess) onSuccess(response);
  };

  const handlePaymentError = async error => {
    console.error('Payment error', error);
    showToast('error', 'Payment Failed', `An error occurred during payment: ${error.message}`);
    if (onError) onError(error);
  };

  const handleRecurringSubscription = async () => {
    if (!setIsProcessing) {
      console.warn("setIsProcessing is not defined");
    } else {
      setIsProcessing(true);
    }
    
    try {
      // Get SDK directly to avoid client issues
      const sdk = await getSDK();
      
      // Create NWC client
      const newNwc = sdk.nwc.NWCClient.withNewSecret();
      
      const yearFromNow = new Date();
      yearFromNow.setFullYear(yearFromNow.getFullYear() + 1);

      const initNwcOptions = {
        name: 'plebdevs.com',
        requestMethods: ['pay_invoice'],
        maxAmount: 50000,
        editable: false,
        budgetRenewal: 'monthly',
        expiresAt: yearFromNow,
      };
      
      console.log("Initializing NWC with options:", initNwcOptions);
      
      // Initialize NWC
      await newNwc.initNWC(initNwcOptions);
      showToast('info', 'Alby', 'Alby connection window opened.');
      
      // Get NWC URL
      const newNWCUrl = newNwc.getNostrWalletConnectUrl();
      console.log("NWC URL generated:", !!newNWCUrl);

      if (newNWCUrl) {
        const nwcProvider = new sdk.webln.NostrWebLNProvider({
          nostrWalletConnectUrl: newNWCUrl,
        });

        await nwcProvider.enable();
        console.log("NWC provider enabled");

        const invoice = await fetchInvoice();
        console.log("Invoice fetched for recurring payment:", !!invoice);

        if (!invoice || !invoice.paymentRequest) {
          showToast('error', 'NWC', `Failed to fetch invoice from ${lnAddress}`);
          if (setIsProcessing) setIsProcessing(false);
          return;
        }

        console.log("Sending payment with NWC provider");
        const paymentResponse = await nwcProvider.sendPayment(invoice.paymentRequest);
        console.log("Payment response:", paymentResponse);

        if (!paymentResponse || !paymentResponse?.preimage) {
          showToast('error', 'NWC', 'Payment failed');
          if (setIsProcessing) setIsProcessing(false);
          return;
        }

        console.log("Updating subscription in API");
        const subscriptionResponse = await axios.put('/api/users/subscription', {
          userId: session.user.id,
          isSubscribed: true,
          nwc: newNWCUrl,
        });

        if (subscriptionResponse.status === 200) {
          track('Subscription Payment', { method: 'recurring', userId: session?.user?.id });
          showToast('success', 'Subscription Setup', 'Recurring subscription setup successful!');
          if (onRecurringSubscriptionSuccess) onRecurringSubscriptionSuccess();
        } else {
          throw new Error(`Unexpected response status: ${subscriptionResponse.status}`);
        }
      } else {
        throw new Error('Failed to generate NWC URL');
      }
    } catch (error) {
      console.error('Error initializing NWC:', error);
      showToast('error', 'Subscription Setup Failed', `Error: ${error.message}`);
      if (onError) onError(error);
    } finally {
      if (setIsProcessing) setIsProcessing(false);
    }
  };

  const handleManualNwcSubmit = async () => {
    if (!nwcInput) {
      showToast('error', 'NWC', 'Please enter a valid NWC URL');
      return;
    }

    if (setIsProcessing) setIsProcessing(true);
    
    try {
      const sdk = await getSDK();
      const nwc = new sdk.webln.NostrWebLNProvider({
        nostrWalletConnectUrl: nwcInput,
      });

      await nwc.enable();
      console.log("Manual NWC provider enabled");

      const invoice = await fetchInvoice();
      console.log("Invoice fetched for manual NWC:", !!invoice);
      
      if (!invoice || !invoice.paymentRequest) {
        showToast('error', 'NWC', `Failed to fetch invoice from ${lnAddress}`);
        if (setIsProcessing) setIsProcessing(false);
        return;
      }

      console.log("Sending payment with manual NWC");
      const payResponse = await nwc.sendPayment(invoice.paymentRequest);
      console.log("Payment response:", payResponse);
      
      if (!payResponse || !payResponse.preimage) {
        showToast('error', 'NWC', 'Payment failed');
        if (setIsProcessing) setIsProcessing(false);
        return;
      }

      showToast('success', 'NWC', 'Payment successful!');

      try {
        console.log("Updating subscription in API (manual)");
        const subscriptionResponse = await axios.put('/api/users/subscription', {
          userId: session.user.id,
          isSubscribed: true,
          nwc: nwcInput,
        });

        if (subscriptionResponse.status === 200) {
          track('Subscription Payment', { method: 'recurring-manual', userId: session?.user?.id });
          showToast('success', 'NWC', 'Subscription setup successful!');
          if (onRecurringSubscriptionSuccess) onRecurringSubscriptionSuccess();
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (error) {
        console.error('Subscription setup error:', error);
        showToast('error', 'NWC', 'Subscription setup failed. Please contact support.');
        if (onError) onError(error);
      }
    } catch (error) {
      console.error('NWC error:', error);
      showToast('error', 'NWC', `An error occurred: ${error.message}`);
      if (onError) onError(error);
    } finally {
      if (setIsProcessing) setIsProcessing(false);
    }
  };

  return (
    <>
      {!invoice && (
        <div
          className={`w-full flex ${layout === 'row' ? 'flex-row justify-between' : 'flex-col items-center'}`}
        >
          {(oneTime || (!oneTime && !recurring)) && (
            <GenericButton
              label="Pay as you go"
              icon="pi pi-bolt"
              onClick={async () => {
                if (status === 'unauthenticated') {
                  console.log('unauthenticated');
                  router.push('/auth/signin');
                } else {
                  const invoice = await fetchInvoice();
                  setInvoice(invoice);
                }
              }}
              severity="primary"
              className="w-fit mt-4 text-[#f8f8ff]"
            />
          )}
          {(recurring || (!oneTime && !recurring)) && (
            <GenericButton
              label="Setup Recurring Subscription"
              icon={
                <Image
                  src="/images/nwc-logo.svg"
                  alt="NWC Logo"
                  width={16}
                  height={16}
                  className="mr-2"
                />
              }
              severity="help"
              className="w-fit mt-4 text-[#f8f8ff] bg-purple-600"
              onClick={() => {
                if (status === 'unauthenticated') {
                  console.log('unauthenticated');
                  router.push('/auth/signin');
                } else {
                  setShowRecurringOptions(!showRecurringOptions);
                }
              }}
            />
          )}
        </div>
      )}
      {showRecurringOptions && (
        <>
          <Divider />
          <div className="w-fit mx-auto flex flex-col items-center mt-24">
            <AlbyButton handleSubmit={handleRecurringSubscription} />
            <span className="my-4 text-lg font-bold">or</span>
            <p className="text-lg font-bold">Manually enter NWC URL</p>
            <span className="text-sm text-gray-500">
              *make sure you set a budget of at least 50000 sats and set budget renewal to monthly
            </span>
            <input
              type="text"
              value={nwcInput}
              onChange={e => setNwcInput(e.target.value)}
              placeholder="Enter NWC URL"
              className="w-full p-2 mb-4 border rounded"
            />
            <GenericButton
              label="Submit"
              onClick={handleManualNwcSubmit}
              className="mt-4 w-fit text-[#f8f8ff]"
            />
          </div>
        </>
      )}
      {invoice && invoice.paymentRequest && (
        <div className="w-full mx-auto mt-8">
          <PaymentModal
            invoice={invoice?.paymentRequest}
            onPaid={handlePaymentSuccess}
            onError={handlePaymentError}
            paymentMethods="external"
            title={`Pay ${amount} sats`}
          />
        </div>
      )}
    </>
  );
};

export default SubscriptionPaymentButtons;
