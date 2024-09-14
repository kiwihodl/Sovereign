import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { parseEvent, findKind0Fields } from '@/utils/nostr';
import { nip19, nip04 } from 'nostr-tools';
import { useSession } from 'next-auth/react';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import { useToast } from '@/hooks/useToast';
import { useNDKContext } from '@/context/NDKContext';
import VideoDetails from '@/components/content/videos/VideoDetails';
import DocumentDetails from '@/components/content/documents/DocumentDetails';
import { ProgressSpinner } from 'primereact/progressspinner';
import { defaultRelayUrls } from '@/context/NDKContext';
import 'primeicons/primeicons.css';

const privkey = process.env.NEXT_PUBLIC_APP_PRIV_KEY;
const pubkey = process.env.NEXT_PUBLIC_APP_PUBLIC_KEY;

export default function Details() {
    const [event, setEvent] = useState(null);
    const [processedEvent, setProcessedEvent] = useState({});
    const [author, setAuthor] = useState(null);
    const [nAddress, setNAddress] = useState(null);
    const [paidResource, setPaidResource] = useState(false);
    const [decryptedContent, setDecryptedContent] = useState(null);
    const [authorView, setAuthorView] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { ndk, addSigner } = useNDKContext();
    const { data: session, update } = useSession();
    const [user, setUser] = useState(null);
    const { showToast } = useToast();

    const router = useRouter();

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    useEffect(() => {
        if (processedEvent.price) {
            setPaidResource(true);
        }
    }, [processedEvent]);

    useEffect(() => {
        const decryptContent = async () => {
            if (paidResource && processedEvent.content) {
                // Check if user is subscribed first
                if (user?.role?.subscribed) {
                    const decryptedContent = await nip04.decrypt(privkey, pubkey, processedEvent.content);
                    setDecryptedContent(decryptedContent);
                } 
                // If not subscribed, check if they have purchased
                else if (user?.purchased?.some(purchase => purchase.resourceId === processedEvent.d)) {
                    const decryptedContent = await nip04.decrypt(privkey, pubkey, processedEvent.content);
                    setDecryptedContent(decryptedContent);
                }
                // If neither subscribed nor purchased, decryptedContent remains null
            }
        };

        decryptContent();
    }, [user, paidResource, processedEvent]);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            if (!slug) {
                return;
            }

            const { data } = nip19.decode(slug)

            if (!data) {
                showToast('error', 'Error', 'Resource not found');
                return;
            }

            const id = data?.identifier;

            const fetchEvent = async (id, retryCount = 0) => {
                setLoading(true);
                setError(null);
                try {
                    await ndk.connect();

                    const filter = {
                        ids: [id]
                    }

                    const event = await ndk.fetchEvent(filter);

                    if (event) {
                        setEvent(event);
                        if (user && user.pubkey === event.pubkey) {
                            setAuthorView(true);
                            if (event.kind === 30402) {
                                const decryptedContent = await nip04.decrypt(privkey, pubkey, event.content);
                                setDecryptedContent(decryptedContent);
                            }
                        }
                    } else {
                        if (retryCount < 1) {
                            // Wait for 2 seconds before retrying
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            return fetchEvent(id, retryCount + 1);
                        } else {
                            setError("Event not found");
                        }
                    }
                } catch (error) {
                    console.error('Error fetching event:', error);
                    if (retryCount < 1) {
                        // Wait for 2 seconds before retrying
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        return fetchEvent(id, retryCount + 1);
                    } else {
                        setError("Failed to fetch event. Please try again.");
                    }
                } finally {
                    setLoading(false);
                }
            };

            if (ndk && id) {
                fetchEvent(id);
            }
        }
    }, [router.isReady, router.query, ndk, user]);

    useEffect(() => {
        const fetchAuthor = async (pubkey) => {
            try {
                await ndk.connect();

                const filter = {
                    kinds: [0],
                    authors: [pubkey]
                }

                const author = await ndk.fetchEvent(filter);
                if (author) {
                    const fields = await findKind0Fields(JSON.parse(author.content));
                    console.log("fields", fields);
                    setAuthor(fields);
                }
            } catch (error) {
                console.error('Error fetching author:', error);
            }
        }
        if (event && ndk) {
            fetchAuthor(event.pubkey);
        }
    }, [ndk, event]);

    useEffect(() => {
        if (event) {
            const parsedEvent = parseEvent(event);
            console.log("parsedEvent", parsedEvent);
            setProcessedEvent(parsedEvent);
        }
    }, [event]);

    useEffect(() => {
        if (processedEvent?.d) {
            const naddr = nip19.naddrEncode({
                pubkey: processedEvent.pubkey,
                kind: processedEvent.kind,
                identifier: processedEvent.d,
                relayUrls: defaultRelayUrls
            });
            setNAddress(naddr);
        }
    }, [processedEvent]);

    const handlePaymentSuccess = async (response, newResource) => {
        if (response && response?.preimage) {
            console.log("newResource", newResource);
            const updated = await update();
            console.log("session after update", updated);
        } else {
            showToast('error', 'Error', 'Failed to purchase resource. Please try again.');
        }
    }

    const handlePaymentError = (error) => {
        showToast('error', 'Payment Error', `Failed to purchase resource. Please try again. Error: ${error}`);
    }

    if (loading) {
        return <div className="mx-auto">
            <ProgressSpinner />
        </div>;
    }

    if (error) {
        return <div className="w-full mx-auto h-screen">
            <div className="text-red-500 text-xl">{error}</div>
        </div>;
    }

    return (
        <div>
            {processedEvent && processedEvent.type !== "workshop" ? (
                <DocumentDetails
                    processedEvent={processedEvent}
                    topics={processedEvent.topics}
                    title={processedEvent.title}
                    summary={processedEvent.summary}
                    image={processedEvent.image}
                    price={processedEvent.price}
                    author={author}
                    paidResource={paidResource}
                    nAddress={nAddress}
                    decryptedContent={decryptedContent}
                    handlePaymentSuccess={handlePaymentSuccess}
                    handlePaymentError={handlePaymentError}
                    authorView={authorView}
                />
            ) : (
                <VideoDetails
                    processedEvent={processedEvent}
                    topics={processedEvent.topics}
                    title={processedEvent.title}
                    summary={processedEvent.summary}
                    image={processedEvent.image}
                    price={processedEvent.price}
                    author={author}
                    paidResource={paidResource}
                    decryptedContent={decryptedContent}
                    nAddress={nAddress}
                    handlePaymentSuccess={handlePaymentSuccess}
                    handlePaymentError={handlePaymentError}
                    authorView={authorView}
                />
            )}
            {typeof window !== 'undefined' && nAddress !== null && (
                <div className='px-4'>
                    <ZapThreadsWrapper
                        anchor={nAddress}
                        user={user?.pubkey || null}
                        relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://relay.mutinywallet.com/, wss://relay.primal.net/"
                        disable="zaps"
                    />
                </div>
            )}
        </div>
    );
}
