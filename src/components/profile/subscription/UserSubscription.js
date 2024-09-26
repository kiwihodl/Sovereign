import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { Card } from 'primereact/card';
import useWindowWidth from '@/hooks/useWindowWidth';
import { Menu } from "primereact/menu";
import { Message } from "primereact/message";
import { ProgressSpinner } from 'primereact/progressspinner';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';
import Image from 'next/image';
import NostrIcon from '../../../../public/images/nostr.png';
import { Badge } from 'primereact/badge';
import GenericButton from '@/components/buttons/GenericButton';
import CancelSubscription from '@/components/profile/subscription/CancelSubscription';
import CalendlyEmbed from '@/components/profile/subscription/CalendlyEmbed';
import Nip05Form from '@/components/profile/subscription/Nip05Form';
import LightningAddressForm from '@/components/profile/subscription/LightningAddressForm';
import RenewSubscription from '@/components/profile/subscription/RenewSubscription';

const UserSubscription = () => {
    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const router = useRouter();
    const windowWidth = useWindowWidth();
    const menu = useRef(null);
    const [user, setUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [subscribedUntil, setSubscribedUntil] = useState(null);
    const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState(null);
    const [calendlyVisible, setCalendlyVisible] = useState(false);
    const [lightningAddressVisible, setLightningAddressVisible] = useState(false);
    const [nip05Visible, setNip05Visible] = useState(false);
    const [cancelSubscriptionVisible, setCancelSubscriptionVisible] = useState(false);
    const [renewSubscriptionVisible, setRenewSubscriptionVisible] = useState(false);

    useEffect(() => {
        if (session && session?.user) {
            setUser(session.user);
        }
    }, [session])

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
        } catch (error) {
            console.error('Session update error:', error);
            showToast('error', 'Session Update Failed', `Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const menuItems = [
        {
            label: "Schedule 1:1",
            icon: "pi pi-calendar",
            command: () => {
                setCalendlyVisible(true);
            },
        },
        {
            label: session?.user?.lightningAddress ? "Update PlebDevs Lightning Address" : "Claim PlebDevs Lightning Address",
            icon: "pi pi-bolt",
            command: () => {
                setLightningAddressVisible(true);
            },
        },
        {
            label: session?.user?.nip05 ? "Update PlebDevs Nostr NIP-05" : "Claim PlebDevs Nostr NIP-05",
            icon: "pi pi-at",
            command: () => {
                setNip05Visible(true);
            },
        },
        {
            label: "Renew Subscription",
            icon: "pi pi-sync",
            command: () => {
                setRenewSubscriptionVisible(true);
            },
        },
        {
            label: "Cancel Subscription",
            icon: "pi pi-trash",
            command: () => {
                setCancelSubscriptionVisible(true);
            },
        },
    ];

    useEffect(() => {
        console.log(subscribed)
    }, [subscribed])

    const subscriptionCardTitle = (
        <div className="w-full flex flex-row justify-between items-center">
            <span className="text-xl text-900 font-bold text-white">Plebdevs Subscription</span>
            {subscribed && (
                <i
                    className="pi pi-ellipsis-h text-2xl cursor-pointer hover:opacity-75"
                    onClick={(e) => menu.current.toggle(e)}
                ></i>
            )}
            <Menu model={menuItems} popup ref={menu} className="w-fit" />
        </div>
    );

    return (
        <div className="p-4">
            {windowWidth < 768 && (
                <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
            )}
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
                        <div className='w-full h-full flex items-center justify-center'><ProgressSpinner /></div>
                        <span className="ml-2">Processing subscription...</span>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-primary">Unlock Premium Benefits</h2>
                            <p className="text-gray-400">Subscribe now and elevate your development journey!</p>
                        </div>
                        <div className="flex flex-col gap-4 mb-4">
                            <div className="flex items-center">
                                <i className="pi pi-book text-2xl text-primary mr-2 text-blue-400"></i>
                                <span>Access ALL current and future PlebDevs content</span>
                            </div>
                            <div className="flex items-center">
                                <i className="pi pi-calendar text-2xl text-primary mr-2 text-red-400"></i>
                                <span>Personal mentorship & guidance and access to exclusive 1:1 booking calendar</span>
                            </div>
                            <div className="flex items-center">
                                <i className="pi pi-bolt text-2xl text-primary mr-2 text-yellow-500"></i>
                                <span>Claim your own personal plebdevs.com Lightning Address</span>
                            </div>
                            <div className="flex items-center">
                                <Image src={NostrIcon} alt="Nostr" width={26} height={26} className='mr-2' />
                                <span>Claim your own personal plebdevs.com Nostr NIP-05 identity</span>
                            </div>
                        </div>
                        <div className="text-center mb-4 flex flex-row justify-start">
                            <i className="pi pi-star text-2xl text-primary mr-2 text-yellow-500"></i>
                            <span className="text-center font-bold">I WILL MAKE SURE YOU WIN HARD AND LEVEL UP AS A DEV!</span>
                        </div>
                        <SubscriptionPaymentButtons
                            onSuccess={handleSubscriptionSuccess}
                            onRecurringSubscriptionSuccess={handleRecurringSubscriptionSuccess}
                            onError={handleSubscriptionError}
                            setIsProcessing={setIsProcessing}
                        />
                    </div>
                )}
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

            <CalendlyEmbed
                visible={calendlyVisible}
                onHide={() => setCalendlyVisible(false)}
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
            <Nip05Form
                visible={nip05Visible}
                onHide={() => setNip05Visible(false)}
            />
            <LightningAddressForm
                visible={lightningAddressVisible}
                onHide={() => setLightningAddressVisible(false)}
            />
        </div>
    );
};

export default UserSubscription;
