import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { initializeBitcoinConnect } from './BitcoinConnect';
import { LightningAddress } from '@getalby/lightning-tools';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { useLocalStorageWithEffect } from '@/hooks/useLocalStroage';
import dynamic from 'next/dynamic';

const PaymentModal = dynamic(
    () => import('@getalby/bitcoin-connect-react').then((mod) => mod.Payment),
    { ssr: false }
);

const SubscriptionPaymentButtons = ({ onSuccess, onError }) => {
    const [invoice, setInvoice] = useState(null);
    const [paid, setPaid] = useState(null);
    const [nwcUrl, setNwcUrl] = useState(null);
    const { showToast } = useToast();
    const { data: session } = useSession();

    const lnAddress = process.env.NEXT_PUBLIC_LIGHTNING_ADDRESS;
    const amount = 25;

    useEffect(() => {
        initializeBitcoinConnect();
    }, []);

    useEffect(() => {
        let intervalId;
        if (invoice) {
            intervalId = setInterval(async () => {
                const paid = await invoice.verifyPayment();

                console.log('paid', paid);
          
                if (paid && invoice.preimage) {
                    setPaid({
                        preimage: invoice.preimage,
                    });
                    clearInterval(intervalId);
                    // handle success
                    onSuccess();
                }
            }, 1000);
        } else {
            console.log('no invoice');
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [invoice]);

    const fetchInvoice = async () => {
        try {
            const ln = new LightningAddress(lnAddress);
            await ln.fetch();
            const newInvoice = await ln.requestInvoice({ satoshi: amount });
            console.log('newInvoice', newInvoice);
            setInvoice(newInvoice);
            return newInvoice;
        } catch (error) {
            console.error('Error fetching invoice:', error);
            showToast('error', 'Invoice Error', 'Failed to fetch the invoice.');
            if (onError) onError(error);
            return null;
        }
    };

    const handlePaymentSuccess = async (response) => {
        console.log('Payment successful', response);
        clearInterval(checkPaymentInterval);
    };

    const handlePaymentError = async (error) => {
        console.error('Payment error', error);
        clearInterval(checkPaymentInterval);
    };

    const handleRecurringSubscription = async () => {
        const { init, launchModal, onConnected } = await import('@getalby/bitcoin-connect-react');
        
        init({
            appName: 'plebdevs.com',
            filters: ['nwc'],
            onConnected: async (connector) => {
                console.log('connector', connector);
                if (connector.type === 'nwc') {
                    console.log('connector inside nwc', connector);
                    const nwcConnector = connector;
                    const url = await nwcConnector.getNWCUrl();
                    setNwcUrl(url);
                    console.log('NWC URL:', url);
                    // Here you can handle the NWC URL, e.g., send it to your backend
                }
            },
        });

        launchModal();

        // Set up a listener for the connection event
        const unsubscribe = onConnected((provider) => {
            console.log('Connected provider:', provider);
            const nwc = provider?.client?.options?.nostrWalletConnectUrl;
            // try to make payment
            // if successful, encrypt and send to db with subscription object on the user
        });

        // Clean up the listener when the component unmounts
        return () => {
            unsubscribe();
        };
    };

    return (
        <>
            {
                !invoice && (
                    <div className="w-full flex flex-row justify-between">
                        <Button
                            label="Pay as you go"
                            icon="pi pi-bolt"
                            onClick={() => {
                                fetchInvoice();
                            }}
                            severity='primary'
                            className="mt-4 text-[#f8f8ff]"
                        />
                        <Button 
                            label="Setup Recurring Subscription" 
                            className="mt-4 text-[#f8f8ff]"
                            onClick={handleRecurringSubscription}
                        />
                    </div>
                )
            }
            {

                invoice && invoice.paymentRequest && (
                    <div className="w-full mx-auto mt-8">
                        <PaymentModal
                            invoice={invoice?.paymentRequest}
                            onPaid={handlePaymentSuccess}
                            onError={handlePaymentError}
                            paymentMethods='external'
                            title={`Pay ${amount} sats`}
                        />
                    </div>
                )
            }
        </>
    );
};

export default SubscriptionPaymentButtons;