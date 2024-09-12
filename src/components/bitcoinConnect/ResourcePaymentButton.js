import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog } from 'primereact/dialog';
import { initializeBitcoinConnect } from './BitcoinConnect';
import { LightningAddress } from '@getalby/lightning-tools';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import GenericButton from '@/components/buttons/GenericButton';

const Payment = dynamic(
  () => import('@getalby/bitcoin-connect-react').then((mod) => mod.Payment),
  { ssr: false }
);

const ResourcePaymentButton = ({ lnAddress, amount, onSuccess, onError, resourceId }) => {
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const { showToast } = useToast();
  const { data: session } = useSession();
  const [dialogVisible, setDialogVisible] = useState(false);

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

  const handlePaymentSuccess = async (response) => {
    try {
      const purchaseData = {
        userId: userId,
        resourceId: resourceId,
        amountPaid: parseInt(amount, 10)
      };

      const result = await axios.post('/api/purchase/resource', purchaseData);

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
    setDialogVisible(false);
  };

  return (
    <>
      {
        invoice ? (
          <GenericButton
            label={`${amount} sats`}
            icon="pi pi-wallet"
            onClick={() => setDialogVisible(true)}
            disabled={!invoice}
            severity='primary'
            rounded
            className="text-[#f8f8ff] text-sm"
          />
        ) : (
          <ProgressSpinner
            style={{ width: '30px', height: '30px' }}
            strokeWidth="8"
            animationDuration=".5s"
          />
        )}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header="Make Payment"
        style={{ width: '50vw' }}
      >
        {invoice ? (
          <Payment
            invoice={invoice.paymentRequest}
            onPaid={handlePaymentSuccess}
            paymentMethods='all'
            title={`Pay ${amount} sats`}
          />
        ) : (
          <p>Loading payment details...</p>
        )}
      </Dialog>
    </>
  );
};

export default ResourcePaymentButton;