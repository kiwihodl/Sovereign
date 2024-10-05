import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import GenericButton from '@/components/buttons/GenericButton';
import useWindowWidth from '@/hooks/useWindowWidth';

const Nip05Form = ({ visible, onHide }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [existingNip05, setExistingNip05] = useState(null);
    const [pubkey, setPubkey] = useState('');
    const [name, setName] = useState('');

    const windowWidth = useWindowWidth();
    const { data: session, update } = useSession();
    const { showToast } = useToast();

    useEffect(() => {
        if (session && session?.user && !session?.user?.nip05) {
            setPubkey(session.user.pubkey || '');
            setName(session.user.name || '');
        } else if (session && session?.user && session?.user?.nip05) {
            setExistingNip05(session.user.nip05);
            setPubkey(session.user.nip05.pubkey || '');
            setName(session.user.nip05.name || '');
        }
    }, [session]);

    const handleNip05 = async () => {
        setIsProcessing(true);
        try {
            let response;
            const lowercaseName = name.toLowerCase();
            if (existingNip05) {
                response = await axios.put(`/api/users/${session.user.id}/nip05`, { pubkey, name: lowercaseName });
            } else {
                response = await axios.post(`/api/users/${session.user.id}/nip05`, { pubkey, name: lowercaseName });
            }
            if (!existingNip05 && response.status === 201) {
                showToast('success', 'NIP-05 Claimed', 'Your NIP-05 has been claimed');
                update();
                onHide();
            } else if (response.status === 200) {
                showToast('success', 'NIP-05 updated', 'Your NIP-05 has been updated');
                update();
                onHide();
            } else {
                console.log("RESPONSE", response);
                showToast('error', 'Error updating NIP-05', response.data.error);
            }
        } catch (error) {
            console.error('Error claiming NIP-05:', error);
            showToast('error', 'Error claiming NIP-05', error.message);
            setIsProcessing(false);
        }
    };

    const deleteNip05 = async () => {
        setIsProcessing(true);
        try {
            const response = await axios.delete(`/api/users/${session.user.id}/nip05`);
            if (response.status === 204) {
                showToast('success', 'NIP-05 deleted', 'Your NIP-05 has been deleted');
                update();
                onHide();
            } else {
                showToast('error', 'Error deleting NIP-05', response.data.error);
            }
        } catch (error) {
            console.error('Error deleting NIP-05:', error);
            showToast('error', 'Error deleting NIP-05', error.message);
            setIsProcessing(false);
        }
    };

    return (
        <Dialog header="NIP-05" visible={visible} onHide={onHide} style={{ width: windowWidth < 768 ? '100vw' : '60vw' }}>
            {existingNip05 ? (
                <p>Update your Pubkey and Name</p>
            ) : (
                <p>Confirm your Pubkey and Name</p>
            )}
            <div className="flex flex-col gap-2 max-mob:min-w-[80vw] max-tab:min-w-[60vw] min-w-[40vw]">
                <InputText placeholder="Pubkey" value={pubkey} onChange={(e) => setPubkey(e.target.value)} />
                <InputText placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {!existingNip05 && (
                <div className="flex flex-row justify-center mt-6">
                    {isProcessing ? <ProgressSpinner /> : <GenericButton severity="success" outlined className="mx-auto" label='Confirm' onClick={handleNip05} />}
                </div>
            )}
            {existingNip05 && (
                <div className="flex flex-row justify-center w-full mt-6 gap-4">
                    <GenericButton severity="success" outlined className="mx-auto" label="Update" onClick={handleNip05} />
                    <GenericButton severity="danger" outlined className="mx-auto" label="Delete" onClick={deleteNip05} />
                </div>
            )}
        </Dialog>
    );
};

export default Nip05Form;