import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';

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
            header="Subscribe to PlebDevs"
            visible={visible}
            onHide={onHide}
            className="p-fluid pb-0 w-fit"
        >
            {isProcessing ? (
                <div className="w-full flex flex-col mx-auto justify-center items-center mt-4">
                    <ProgressSpinner />
                    <span className="ml-2">Processing subscription...</span>
                </div>
            ) : (
                <Card className="shadow-lg">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-primary">Unlock Premium Benefits</h2>
                        <p className="text-gray-400">Subscribe now and elevate your development journey!</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center">
                            <i className="pi pi-book text-2xl text-primary mr-2"></i>
                            <span>Access ALL current and future content</span>
                        </div>
                        <div className="flex items-center">
                            <i className="pi pi-users text-2xl text-primary mr-2"></i>
                            <span>Join PlebLab Bitcoin Hackerspace Slack</span>
                        </div>
                        <div className="flex items-center">
                            <i className="pi pi-calendar text-2xl text-primary mr-2"></i>
                            <span>Exclusive 1:1 booking calendar</span>
                        </div>
                        <div className="flex items-center">
                            <i className="pi pi-star text-2xl text-primary mr-2"></i>
                            <span>Personal mentorship & guidance</span>
                        </div>
                    </div>
                    <div className="text-center mb-4 flex flex-row justify-center">
                        <Badge value="BONUS" severity="success" className="mr-2"></Badge>
                        <span className="text-center font-bold">I WILL MAKE SURE YOU WIN HARD AND LEVEL UP AS A DEV!</span>
                    </div>
                    <SubscriptionPaymentButtons
                        onSuccess={handleSubscriptionSuccess}
                        onRecurringSubscriptionSuccess={handleRecurringSubscriptionSuccess}
                        onError={handleSubscriptionError}
                        setIsProcessing={setIsProcessing}
                    />
                </Card>
            )}
        </Dialog>
    );
};

export default SubscribeModal;