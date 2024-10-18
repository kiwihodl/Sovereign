import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dialog } from 'primereact/dialog';
import { LightningAddress } from '@getalby/lightning-tools';
import { track } from '@vercel/analytics';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import GenericButton from '@/components/buttons/GenericButton';
import { useRouter } from 'next/router';
import useWindowWidth from '@/hooks/useWindowWidth';

const Payment = dynamic(
    () => import('@getalby/bitcoin-connect-react').then((mod) => mod.Payment),
    { ssr: false }
);

const CoursePaymentButton = ({ lnAddress, amount, onSuccess, onError, courseId }) => {
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const { data: session, status } = useSession();
    const [dialogVisible, setDialogVisible] = useState(false);
    const router = useRouter();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    useEffect(() => {
        let intervalId;
        if (invoice) {
            intervalId = setInterval(async () => {
                const paid = await invoice.verifyPayment();
    
                if (paid && invoice.preimage) {
                    clearInterval(intervalId);
                    // handle success
                    handlePaymentSuccess({ paid, preimage: invoice.preimage });
                }
            }, 2000);
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
        setIsLoading(true);
        try {
            const ln = new LightningAddress(lnAddress);
            await ln.fetch();
            const invoice = await ln.requestInvoice({ satoshi: amount });
            setInvoice(invoice);
            setDialogVisible(true);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            showToast('error', 'Invoice Error', 'Failed to fetch the invoice.');
            if (onError) onError(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        console.log('invoice', invoice);
    }, [invoice]);

    const handlePaymentSuccess = async (response) => {
        try {
            const purchaseData = {
                userId: session.user.id,
                courseId: courseId,
                amountPaid: parseInt(amount, 10)
            };

            const result = await axios.post('/api/purchase/course', purchaseData);

            if (result.status === 200) {
                track('Course Payment', { courseId: courseId });
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
            <GenericButton
                label={`${amount} sats`}
                icon="pi pi-wallet"
                onClick={() => {
                    if (status === 'unauthenticated') {
                        console.log('unauthenticated');
                        router.push('/auth/signin');
                    } else {
                        fetchInvoice();
                    }
                }}
                disabled={isLoading}
                severity='primary'
                rounded
                className={`text-[#f8f8ff] text-sm ${isLoading ? 'hidden' : ''}`}
            />
            {isLoading && (
                <div className='w-full h-full flex items-center justify-center'>
                    <ProgressSpinner
                        style={{ width: '30px', height: '30px' }}
                        strokeWidth="8"
                        animationDuration=".5s"
                    />
                </div>
            )}
            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header="Make Payment"
                style={{ width: isMobile ? '90vw' : '50vw' }}
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

export default CoursePaymentButton;