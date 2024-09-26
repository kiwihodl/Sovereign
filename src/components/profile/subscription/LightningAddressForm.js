import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import GenericButton from '@/components/buttons/GenericButton';

const LightningAddressForm = ({ visible, onHide }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [existingLightningAddress, setExistingLightningAddress] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [maxSendable, setMaxSendable] = useState(10000000);
    const [minSendable, setMinSendable] = useState(1);
    const [invoiceMacaroon, setInvoiceMacaroon] = useState('');
    const [lndCert, setLndCert] = useState('');
    const [lndHost, setLndHost] = useState('');
    const [lndPort, setLndPort] = useState('8080');

    const { data: session, update } = useSession();
    const { showToast } = useToast();

    useEffect(() => {
        if (session && session?.user && !session?.user?.lightningAddress) {
            setName(session.user.name || '');
        } else if (session && session?.user && session?.user?.lightningAddress) {
            setExistingLightningAddress(session.user.lightningAddress);
            setName(session.user.lightningAddress.name || '');
            setDescription(session.user.lightningAddress.description || '');
            setMaxSendable(session.user.lightningAddress.maxSendable || 10000000);
            setMinSendable(session.user.lightningAddress.minSendable || 1);
            setInvoiceMacaroon(session.user.lightningAddress.invoiceMacaroon || '');
            setLndCert(session.user.lightningAddress.lndCert || '');
            setLndHost(session.user.lightningAddress.lndHost || '');
            setLndPort(session.user.lightningAddress.lndPort || '8080');
        }
    }, [session]);

    const handleLightningAddress = async () => {
        setIsProcessing(true);
        try {
            let response;
            const lowercaseName = name.toLowerCase();
            if (existingLightningAddress) {
                response = await axios.put(`/api/users/${session.user.id}/lightning-address`, { name: lowercaseName, description, maxSendable, minSendable, invoiceMacaroon, lndCert, lndHost, lndPort });
            } else {
                response = await axios.post(`/api/users/${session.user.id}/lightning-address`, { name: lowercaseName, description, maxSendable, minSendable, invoiceMacaroon, lndCert, lndHost, lndPort });
            }
            if (!existingLightningAddress && response.status === 201) {
                showToast('success', 'Lightning Address Claimed', 'Your Lightning Address has been claimed');
                update();
                onHide();
            } else if (existingLightningAddress && response.status === 200) {
                showToast('success', 'Lightning Address updated', 'Your Lightning Address has been updated');
                update();
                onHide();
            } else {
                showToast('error', 'Error updating Lightning Address', response.data.error);
            }
        } catch (error) {
            console.error('Error claiming Lightning Address:', error);
            showToast('error', 'Error claiming Lightning Address', error.message);
            setIsProcessing(false);
        }
    };

    const deleteLightningAddress = async () => {
        setIsProcessing(true);
        try {
            const response = await axios.delete(`/api/users/${session.user.id}/lightning-address`);
            if (response.status === 204) {
                showToast('success', 'Lightning Address deleted', 'Your Lightning Address has been deleted');
                update();
                onHide();
            } else {
                showToast('error', 'Error deleting Lightning Address', response.data.error);
            }
        } catch (error) {
            console.error('Error deleting Lightning Address:', error);
            showToast('error', 'Error deleting Lightning Address', error.message);
            setIsProcessing(false);
        }
    };

    return (
        <Dialog header="Lightning Address" visible={visible} onHide={onHide}>
            {existingLightningAddress ? (
                <p>Update your Lightning Address details</p>
            ) : (
                <p>Confirm your Lightning Address details</p>
            )}
            <div className="flex flex-col gap-2 max-mob:min-w-[80vw] max-tab:min-w-[60vw] min-w-[40vw]">
                <label>Name</label>
                <InputText placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <label>Description</label>
                <InputText placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <label>Max Sendable</label>
                <InputText placeholder="Max Sendable" value={maxSendable} onChange={(e) => setMaxSendable(e.target.value)} />
                <label>Min Sendable</label>
                <InputText placeholder="Min Sendable" value={minSendable} onChange={(e) => setMinSendable(e.target.value)} />
                <label>Invoice Macaroon</label>
                <InputText placeholder="Invoice Macaroon" value={invoiceMacaroon} onChange={(e) => setInvoiceMacaroon(e.target.value)} />
                <label>LND Cert</label>
                <InputText placeholder="LND Cert" value={lndCert} onChange={(e) => setLndCert(e.target.value)} />
                <label>LND Host</label>
                <InputText placeholder="LND Host" value={lndHost} onChange={(e) => setLndHost(e.target.value)} />
                <label>LND Port</label>
                <InputText placeholder="LND Port" value={lndPort} onChange={(e) => setLndPort(e.target.value)} />
            </div>
            {!existingLightningAddress && (
                <div className="flex flex-row justify-center mt-6">
                    {isProcessing ? <ProgressSpinner /> : <GenericButton severity="success" outlined className="mx-auto" label='Confirm' onClick={handleLightningAddress} />}
                </div>
            )}
            {existingLightningAddress && (
                <div className="flex flex-row justify-center w-full mt-6 gap-4">
                    <GenericButton severity="success" outlined className="mx-auto" label="Update" onClick={handleLightningAddress} />
                    <GenericButton severity="danger" outlined className="mx-auto" label="Delete" onClick={deleteLightningAddress} />
                </div>
            )}
        </Dialog>
    );
};

export default LightningAddressForm;
