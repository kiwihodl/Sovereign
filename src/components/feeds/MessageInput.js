import React, { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import GenericButton from '@/components/buttons/GenericButton';
import { Panel } from 'primereact/panel';
import { useNDKContext } from "@/context/NDKContext";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useToast } from '@/hooks/useToast';

const MessageInput = ({ onMessageSent }) => {
    const [message, setMessage] = useState('');
    const [collapsed, setCollapsed] = useState(false);
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

    const headerTemplate = (options) => {
        return (
            <div className="flex align-items-center justify-content-between my-1 py-2">
                <GenericButton outlined severity="primary" size="small" className="py-1" onClick={options.onTogglerClick} icon={options.collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'} />
                <h3 className="m-0 ml-2">New Message</h3>
            </div>
        );
    };

    return (
        <Panel 
            headerTemplate={headerTemplate}
            toggleable 
            collapsed={collapsed} 
            onToggle={(e) => setCollapsed(e.value)}
            className="w-full"
        >
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
                <GenericButton
                    label="Send"
                    icon="pi pi-send"
                    outlined
                    onClick={handleSubmit}
                    className="w-fit py-2"
                />
            </div>
        </Panel>
    );
};

export default MessageInput;