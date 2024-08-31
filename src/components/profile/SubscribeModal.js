import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';

const SubscribeModal = ({ visible, onHide }) => {
    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const router = useRouter();

    const handleSubscriptionSuccess = async () => {
        try {
            const response = await axios.put('/api/users/subscription', {
                userId: session.user.id,
                isSubscribed: true,
            });
            if (response.data) {
                await update();
                showToast('success', 'Subscription successful', 'success');
                onHide();
                router.reload();
            }
        } catch (error) {
            console.error('Subscription update error:', error);
            showToast('error', 'Subscription failed', 'error');
        }
    };

    const handleSubscriptionError = (error) => {
        console.error('Subscription error:', error);
        showToast('error', 'Subscription failed', 'error');
    };

    return (
        <Dialog
            header="Subscribe"
            visible={visible}
            style={{ width: '50vw' }}
            onHide={onHide}
        >
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
                onError={handleSubscriptionError}
            />
        </Dialog>
    );
};

export default SubscribeModal;