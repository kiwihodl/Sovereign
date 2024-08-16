import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { initializeBitcoinConnect } from './BitcoinConnect';
import { LightningAddress } from '@getalby/lightning-tools';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import axios from 'axios'; // Import axios for API calls

const PayButton = dynamic(
  () => import('@getalby/bitcoin-connect-react').then((mod) => mod.PayButton),
  {
    ssr: false,
  }
);

const CoursePaymentButton = ({ lnAddress, amount, onSuccess, onError, courseId }) => {
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const { showToast } = useToast();
  const [pollingInterval, setPollingInterval] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      setUserId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    initializeBitcoinConnect();
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const ln = new LightningAddress(lnAddress);
        await ln.fetch();
        const invoice = await ln.requestInvoice({ satoshi: amount });
        setInvoice(invoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        showToast('error', 'Invoice Error', 'Failed to fetch the invoice.');
        if (onError) onError(error);
      }
    };

    fetchInvoice();
  }, [lnAddress, amount, onError, showToast]);

  const startPolling = (invoice) => {
    const intervalId = setInterval(async () => {
      try {
        const paid = await invoice.verifyPayment();
        console.log('Polling for payment - Paid:', paid);
        if (paid) {
          clearInterval(intervalId); // Stop polling
          handlePaymentSuccess(invoice);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(intervalId); // Stop polling on error
        handlePaymentError(error);
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(intervalId);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handlePaymentSuccess = async (response) => {
    stopPolling();
    await closeModal();

    try {
      const purchaseData = {
        userId: userId,
        courseId: courseId,
        amountPaid: parseInt(amount, 10)
      };

      const result = await axios.post('/api/purchase/course', purchaseData);

      if (result.status === 200) {
        showToast('success', 'Payment Successful', `Paid ${amount} sats and updated user purchases`);
        if (onSuccess) onSuccess(response);
      } else {
        throw new Error('Failed to update user purchases');
      }
    } catch (error) {
      console.error('Error updating user purchases:', error);
      showToast('error', 'Purchase Update Failed', 'Payment was successful, but failed to update user purchases.');
      if (onError) onError(error);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    showToast('error', 'Payment Failed', error.message || 'An error occurred during payment.');
    if (onError) onError(error);
    stopPolling(); // Stop polling on error
  };

  const handleModalOpen = () => {
    console.log('Modal opened');
    if (invoice) {
      startPolling(invoice); // Start polling when modal is opened
    }
  };

  const handleModalClose = () => {
    console.log('Modal closed');
    stopPolling(); // Stop polling when modal is closed
  };

  const closeModal = async () => {
    const { closeModal } = await import('@getalby/bitcoin-connect-react');
    closeModal();
  };

  return (
    <div className="flex items-center">
      {invoice ? (
        <PayButton
          invoice={invoice.paymentRequest}
          onClick={handleModalOpen}
          onPaid={handlePaymentSuccess}
          onModalClose={handleModalClose}
          title={`Pay ${amount} sats`}
        >
          Pay Now
        </PayButton>
      ) : (
        <button disabled className="p-2 bg-gray-500 text-white rounded">
          Loading...
        </button>
      )}
      <span className="ml-2 text-white text-lg">{amount} sats</span>
    </div>
  );
};

export default CoursePaymentButton;
