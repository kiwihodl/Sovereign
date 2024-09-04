import React, { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { useNDKContext } from "@/context/NDKContext";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useToast } from '@/hooks/useToast';

const MessageInput = ({ onMessageSent }) => {
    const [message, setMessage] = useState('');
    const { ndk, addSigner } = useNDKContext();
    const { showToast } = useToast();
    const handleSubmit = async () => {
        if (!message.trim() || !ndk) return;

        try {
            if (!ndk.signer) {
                await addSigner();
            }

            const event = new NDKEvent(ndk);
            event.kind = 1;
            event.content = message;
            event.tags = [['t', 'plebdevs']];

            await event.publish();
            showToast('success', 'Message Sent', 'Your message has been sent to the PlebDevs community.');
            setMessage(''); // Clear the input after successful publish
            onMessageSent(); // Call this function to close the accordion
        } catch (error) {
            console.error("Error publishing message:", error);
            showToast('error', 'Error', 'There was an error sending your message. Please try again.');
        }
    };

    return (
        <Panel header={null} toggleable collapsed={false} className="w-full" pt={{
            header: {
                className: 'bg-transparent',
                border: 'none',
            },
            toggler: {
                className: 'bg-transparent',
                border: 'none',
            },
            togglerIcon: {
                display: 'none',
            },
        }}>
            <div className="w-full flex flex-col">
                <InputTextarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    cols={10}
                    autoResize
                    placeholder="Type your message here..."
                    className="w-full"
                />
            </div>
            <div className="w-full flex flex-row justify-end mt-4">
                <Button
                    label="Send"
                    icon="pi pi-send"
                    outlined
                    onClick={handleSubmit}
                />
            </div>
        </Panel>
    );
};

export default MessageInput;