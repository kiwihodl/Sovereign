import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { ProgressSpinner } from 'primereact/progressspinner';
import GenericButton from '@/components/buttons/GenericButton';

const CancelSubscription = ({ visible, onHide }) => {
  const { data: session, update } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();
  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.put('/api/users/subscription', {
        userId: session.user.id,
        isSubscribed: false,
        nwc: null,
      });
      if (response.status === 200) {
        showToast('success', 'Subscription canceled', 'Subscription canceled successfully');
        update();
        onHide();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      showToast('error', 'Error canceling subscription', error.message);
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      header="Cancel Subscription"
      visible={visible}
      onHide={onHide}
    >
      <p>Are you sure you want to cancel your subscription?</p>
      <div className="flex flex-row justify-center mt-6">
        {isProcessing ? (
          <ProgressSpinner />
        ) : (
          <GenericButton
            severity="danger"
            outlined
            className="mx-auto"
            label="Cancel Subscription"
            onClick={handleCancelSubscription}
          />
        )}
      </div>
    </Modal>
  );
};

export default CancelSubscription;
