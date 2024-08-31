import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';

// todo encrypt nwc before saving in db
const SubscribeModal = ({ visible, onHide }) => {
    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubscriptionSuccess = async (response) => {
        setIsProcessing(true);
        try {
            const apiResponse = await axios.put('/api/users/subscription', {
                userId: session.user.id,
                isSubscribed: true,
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

    const handleSubscriptionError = (error) => {
        console.error('Subscription error:', error);
        showToast('error', 'Subscription Failed', `An error occurred: ${error.message}`);
        setIsProcessing(false);
    };

    const handleRecurringSubscriptionSuccess = async () => {
        setIsProcessing(true);
        try {
            await update();
            showToast('success', 'Recurring Subscription Activated', 'Your recurring subscription has been set up successfully.');
            onHide();
        } catch (error) {
            console.error('Session update error:', error);
            showToast('error', 'Session Update Failed', `Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog
            header="Subscribe"
            visible={visible}
            style={{ width: '50vw' }}
            onHide={onHide}
        >
            {isProcessing ? (
                <div className="w-full flex flex-col mx-auto justify-center items-center mt-4">
                    <ProgressSpinner />
                    <span className="ml-2">Processing subscription...</span>
                </div>
            ) : (
                <>
                    <p className="m-0 font-bold">
                        Subscribe to PlebDevs and get access to:
                    </p>
                    <ul>
                        <li>- All of our content free and paid</li>
                        <li>- PlebLab Bitcoin Hackerspace Slack</li>
                        <li>- An exclusive calendar to book 1:1&apos;s with our team</li>
                    </ul>
                    <p className="m-0 font-bold">
                        ALSO
                    </p>
                    <ul>
                        <li>- I WILL MAKE SURE YOU WIN HARD AND LEVEL UP AS A DEV</li>
                    </ul>
                    <SubscriptionPaymentButtons
                        onSuccess={handleSubscriptionSuccess}
                        onRecurringSubscriptionSuccess={handleRecurringSubscriptionSuccess}
                        onError={handleSubscriptionError}
                        setIsProcessing={setIsProcessing}
                    />
                </>
            )}
        </Dialog>
    );
};

export default SubscribeModal;