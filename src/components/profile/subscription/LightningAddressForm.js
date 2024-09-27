import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputNumber } from 'primereact/inputnumber';
import GenericButton from '@/components/buttons/GenericButton';
import useWindowWidth from '@/hooks/useWindowWidth';

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

    const windowWidth = useWindowWidth();
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
        <Dialog header="Lightning Address" visible={visible} onHide={onHide} style={{ width: windowWidth < 768 ? '100vw' : '60vw' }}>
            {existingLightningAddress ? (
                <p>Update your Lightning Address details</p>
            ) : (
                <p>Confirm your Lightning Address details</p>
            )}
            <p className="text-sm text-gray-500">Only LND is currently supported at this time</p>
            <div className="mt-4 flex flex-col gap-2 max-mob:min-w-[80vw] max-tab:min-w-[60vw] min-w-[40vw]">
                <label>Name</label>
                <InputText placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} tooltip='This is your Lightning Address name, it must be unique and will be displayed as name@plebdevs.com' />
                <label>Description</label>
                <InputText placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} tooltip='This is your Lightning Address description, it will be displayed as the description LUD16 lnurlp endpoint' />
                <label>Max Sendable</label>
                {/* Todo: max is 2,147,483 sats until i imlement bigInt for sat amounts */}
                <InputNumber placeholder="Max Sendable" value={maxSendable} onChange={(e) => setMaxSendable(e.target.value)} max={2147483647} min={1000} tooltip='This is the maximum amount of sats that can be sent to your Lightning Address (currently denominated in sats NOT msat)' />
                <label>Min Sendable</label>
                <InputNumber placeholder="Min Sendable" value={minSendable} onChange={(e) => setMinSendable(e.target.value)} min={1} max={2147483647} tooltip='This is the minimum amount of sats that can be sent to your Lightning Address (currently denominated in sats NOT msat)' />
                <label>Invoice Macaroon</label>
                <InputText placeholder="Invoice Macaroon" value={invoiceMacaroon} onChange={(e) => setInvoiceMacaroon(e.target.value)} tooltip='This is your LND Invoice Macaroon, it is used to create invoices for your Lightning Address but DOES NOT grant access to move funds from your LND node' />
                <label>LND Cert</label>
                <InputText placeholder="LND Cert" value={lndCert} onChange={(e) => setLndCert(e.target.value)} tooltip='This is your LND TLS Certificate, it is used to connect to your LND node (this may be optional)' />
                <label>LND Host</label>
                <InputText placeholder="LND Host" value={lndHost} onChange={(e) => setLndHost(e.target.value)} tooltip='This is your LND Host, it is the hostname to your LND node' />
                <label>LND Port</label>
                <InputText placeholder="LND Port" value={lndPort} onChange={(e) => setLndPort(e.target.value)} tooltip='This is your LND Port, it is the port to your LND node (defaults to 8080)' />
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
