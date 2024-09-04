import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { Card } from 'primereact/card';
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Message } from "primereact/message";
import { ProgressSpinner } from 'primereact/progressspinner';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';

const UserSubscription = ({ user }) => {
    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [subscribedUntil, setSubscribedUntil] = useState(null);
    const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState(null);
    const menu = useRef(null);

    useEffect(() => {
        if (user && user.role) {
            setSubscribed(user.role.subscribed);
            const subscribedAt = new Date(user.role.lastPaymentAt);
            const subscribedUntil = new Date(subscribedAt.getTime() + 31 * 24 * 60 * 60 * 1000);
            setSubscribedUntil(subscribedUntil);
            if (user.role.subscriptionExpiredAt) {
                const expiredAt = new Date(user.role.subscriptionExpiredAt)
                setSubscriptionExpiredAt(expiredAt);
            }
        }
    }, [user]);

    const handleSubscriptionSuccess = async (paymentResponse) => {
        setIsProcessing(true);
        try {
            const response = await axios.post('/api/subscription/create', {
                paymentResponse,
            });
            if (response.data.success) {
                showToast('success', 'Subscription successful!');
                await update();
                router.push('/dashboard');
            } else {
                showToast('error', 'Subscription failed. Please try again.');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            showToast('error', 'An error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubscriptionError = (error) => {
        console.error('Subscription error:', error);
        showToast('error', 'An error occurred during subscription. Please try again.');
    };

    const handleRecurringSubscriptionSuccess = async (paymentResponse) => {
        setIsProcessing(true);
        try {
            const response = await axios.post('/api/subscription/recurring', {
                paymentResponse,
            });
            if (response.data.success) {
                showToast('success', 'Recurring subscription set up successfully!');
                await update();
                router.push('/dashboard');
            } else {
                showToast('error', 'Failed to set up recurring subscription. Please try again.');
            }
        } catch (error) {
            console.error('Recurring subscription error:', error);
            showToast('error', 'An error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const menuItems = [
        {
            label: "Renew Subscription",
            icon: "pi pi-bolt",
            command: () => {
                // Add your renew functionality here
            },
        },
        {
            label: "Schedule 1:1",
            icon: "pi pi-calendar",
            command: () => {
                // Add your schedule functionality here
            },
        },
        {
            label: "Cancel Subscription",
            icon: "pi pi-trash",
            command: () => {
                // Add your cancel functionality here
            },
        },
    ];

    const subscriptionCardTitle = (
        <div className="w-full flex flex-row justify-between items-center">
            <span className="text-xl text-900 font-bold text-white">Plebdevs Subscription</span>
            <i
                className="pi pi-ellipsis-h text-2xlcursor-pointer hover:opacity-75"
                onClick={(e) => menu.current.toggle(e)}
            ></i>
            <Menu model={menuItems} popup ref={menu} />
        </div>
    );

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
            <Card title={subscriptionCardTitle} className="mb-6">
                {subscribed && (
                    <div className="flex flex-col">
                        <Message className="w-fit" severity="success" text="Subscribed!" />
                        <p className="mt-4">Thank you for your support 🎉</p>
                        <p className="text-sm text-gray-400">Pay-as-you-go subscription will renew on {subscribedUntil.toLocaleDateString()}</p>
                    </div>
                )}
                {(!subscribed && !subscriptionExpiredAt) && (
                    <div className="flex flex-col">
                        <Message className="w-fit" severity="info" text="You currently have no active subscription" />
                    </div>
                )}
                {subscriptionExpiredAt && (
                    <div className="flex flex-col">
                        <Message className="w-fit" severity="warn" text={`Your subscription expired on ${subscriptionExpiredAt.toLocaleDateString()}`} />
                    </div>
                )}
            </Card>

            <Card title="Subscribe to PlebDevs" className="mb-6">
                {isProcessing ? (
                    <div className="w-full flex flex-col mx-auto justify-center items-center mt-4">
                        <ProgressSpinner />
                        <span className="ml-2">Processing subscription...</span>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-semibold mb-4">Choose your subscription plan:</h2>
                        <div className="flex flex-col gap-4">
                            <Card className='bg-gray-900 w-fit'>
                                <h3 className="text-xl font-semibold mb-2">Monthly Subscription</h3>
                                <p className="mb-4">Get access to all PlebDevs features / content one month at a time.</p>
                                <SubscriptionPaymentButtons
                                    onSuccess={handleSubscriptionSuccess}
                                    onError={handleSubscriptionError}
                                    amount={10}
                                    currency="USD"
                                    buttonText="Subscribe for $10/month"
                                    oneTime={true}
                                />
                            </Card>
                            <Card className='bg-gray-900 w-fit'>
                                <h3 className="text-xl font-semibold mb-2">Recurring Monthly Subscription</h3>
                                <p className="mb-4">Setup auto recurring monthly payments for uninterrupted access.</p>
                                <SubscriptionPaymentButtons
                                    onSuccess={handleRecurringSubscriptionSuccess}
                                    onError={handleSubscriptionError}
                                    amount={10}
                                    currency="USD"
                                    buttonText="Set up recurring $10/month"
                                    recurring={true}
                                />
                            </Card>
                        </div>
                    </div>
                )}
            </Card>

            <Card title="Subscription Benefits" className="mb-6">
                <ul className="list-disc pl-6">
                    <li>Access to exclusive content</li>
                    <li>Priority support</li>
                    <li>Early access to new features</li>
                    <li>Community forums</li>
                </ul>
            </Card>

            <Card title="Frequently Asked Questions" className="mb-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">How does the subscription work?</h3>
                        <p>Our subscription provides monthly access to all PlebDevs features. You can choose between a one-time payment or a recurring subscription.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Can I cancel my subscription?</h3>
                        <p>Yes, you can cancel your subscription at any time. Your access will remain active until the end of the current billing period.</p>
                    </div>
                    {/* Add more FAQ items as needed */}
                </div>
            </Card>
        </div>
    );
};

export default UserSubscription;
