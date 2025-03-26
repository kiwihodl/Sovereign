import React, { useState, useEffect, useRef } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import GenericButton from '@/components/buttons/GenericButton';
import { useNDKContext } from "@/context/NDKContext";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'
import appConfig from '@/config/appConfig';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';

const MessageInput = () => {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { ndk, addSigner } = useNDKContext();
    const { showToast } = useToast();
    const { data: session } = useSession();
    const pool = useRef(null);

    // Initialize pool when needed
    const getPool = async () => {
        if (!pool.current) {
            pool.current = new SimplePool();
        }
        return pool.current;
    };

    const publishToRelay = async (relay, event, currentPool) => {
        try {
            // Wait for relay connection
            await currentPool.ensureRelay(relay);
            // Try to publish
            await currentPool.publish([relay], event);
            return true;
        } catch (err) {
            console.warn(`Failed to publish to ${relay}:`, err);
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!message.trim()) return;
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            if (session && session?.user && session.user?.privkey) {
                await handleManualSubmit(session.user.privkey);
            } else {
                await handleExtensionSubmit();
            }
        } catch (error) {
            console.error("Error submitting message:", error);
            showToast('error', 'Error', 'There was an error sending your message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleExtensionSubmit = async () => {
        if (!ndk) return;

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
            setMessage('');
        } catch (error) {
            console.error("Error publishing message:", error);
            throw error;
        }
    };

    const handleManualSubmit = async (privkey) => {
        try {
            let event = finalizeEvent({
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ['t', 'plebdevs']
                ],
                content: message,
            }, privkey);
              
            let isGood = verifyEvent(event);
            if (!isGood) {
                throw new Error('Event verification failed');
            }

            try {
                const currentPool = await getPool();
                let publishedToAny = false;

                // Try to publish to each relay sequentially
                for (const relay of appConfig.defaultRelayUrls) {
                    const success = await publishToRelay(relay, event, currentPool);
                    if (success) {
                        publishedToAny = true;
                        break; // Stop after first successful publish
                    }
                }

                if (publishedToAny) {
                    showToast('success', 'Message Sent', 'Your message has been sent to the PlebDevs community.');
                    setMessage('');
                } else {
                    throw new Error('Failed to publish to any relay');
                }
            } catch (err) {
                console.error("Publishing error:", err);
                throw err;
            }
        } catch (error) {
            console.error("Error finalizing event:", error);
            throw error;
        }
    }

    return (
        <div className="flex flex-row items-center gap-2">
            <InputTextarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={1}
                autoResize
                placeholder="Type your message here..."
                className="flex-1 bg-[#1e2732] border-[#2e3b4e] rounded-lg"
                disabled={isSubmitting}
            />
            <GenericButton
                icon="pi pi-send"
                outlined
                onClick={handleSubmit}
                className="h-full"
                disabled={isSubmitting || !message.trim()}
                loading={isSubmitting}
            />
        </div>
    );
};

export default MessageInput;