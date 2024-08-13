import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { parseEvent, findKind0Fields } from '@/utils/nostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import { getSatAmountFromInvoice } from '@/utils/lightning';
import ZapDisplay from '@/components/zaps/ZapDisplay';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { nip19, nip04 } from 'nostr-tools';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import { useToast } from '@/hooks/useToast';
import { useNDKContext } from '@/context/NDKContext';
import ResourceDetails from '@/components/content/resources/ResourceDetails';
import { useZapsSubscription } from '@/hooks/nostrQueries/zaps/useZapsSubscription';
import ResourcePaymentButton from '@/components/bitcoinConnect/ResourcePaymentButton';
import 'primeicons/primeicons.css';

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

const privkey = process.env.NEXT_PUBLIC_APP_PRIV_KEY;
const pubkey = process.env.NEXT_PUBLIC_APP_PUBLIC_KEY;

export default function Details() {
    const [event, setEvent] = useState(null);
    const [processedEvent, setProcessedEvent] = useState({});
    const [author, setAuthor] = useState(null);
    const [bitcoinConnect, setBitcoinConnect] = useState(false);
    const [nAddress, setNAddress] = useState(null);
    const [zapAmount, setZapAmount] = useState(null);
    const [paidResource, setPaidResource] = useState(false);
    const [decryptedContent, setDecryptedContent] = useState(null);
    const [authorView, setAuthorView] = useState(false);

    const ndk = useNDKContext();
    const { data: session, update } = useSession();
    const [user, setUser] = useState(null);
    const { returnImageProxy } = useImageProxy();
    const { showToast } = useToast();
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: processedEvent });

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
        if (typeof window === 'undefined') return;

        const bitcoinConnectConfig = window.localStorage.getItem('bc:config');

        if (bitcoinConnectConfig) {
            setBitcoinConnect(true);
        }
    }, []);

    useEffect(() => {
        const decryptContent = async () => {
            if (user && paidResource) {
                if (user?.purchased?.length > 0) {
                    const purchasedResource = user?.purchased.find(purchase => purchase.resourceId === processedEvent.d);
                    if (purchasedResource) {
                        console.log("purchasedResource", purchasedResource)
                        const decryptedContent = await nip04.decrypt(privkey, pubkey, processedEvent.content);
                        setDecryptedContent(decryptedContent);
                    }
                } else if (user?.role && user?.role.subscribed) {
                    // decrypt the content
                    const decryptedContent = await nip04.decrypt(privkey, pubkey, processedEvent.content);
                    setDecryptedContent(decryptedContent);
                }
            }

        }
        decryptContent();
    }, [user, paidResource, processedEvent]);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            const fetchEvent = async (slug) => {
                try {
                    await ndk.connect();

                    const filter = {
                        ids: [slug]
                    }

                    const event = await ndk.fetchEvent(filter);

                    if (event) {
                        setEvent(event);
                        if (user && user.pubkey === event.pubkey) {
                            setAuthorView(true);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching event:', error);
                }
            };
            if (ndk) {
                fetchEvent(slug);
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
            setProcessedEvent(parsedEvent);
        }
    }, [event]);

    useEffect(() => {
        if (processedEvent?.d) {
            const naddr = nip19.naddrEncode({
                pubkey: processedEvent.pubkey,
                kind: processedEvent.kind,
                identifier: processedEvent.d,
            });
            setNAddress(naddr);
        }
    }, [processedEvent]);

    useEffect(() => {
        if (!zaps) return;

        let total = 0;
        zaps.forEach((zap) => {
            const bolt11Tag = zap.tags.find(tag => tag[0] === "bolt11");
            const invoice = bolt11Tag ? bolt11Tag[1] : null;
            if (invoice) {
                const amount = getSatAmountFromInvoice(invoice);
                total += amount;
            }
        });

        setZapAmount(total);
    }, [zaps]);

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`/api/resources/${processedEvent.d}`);
            if (response.status === 204) {
                showToast('success', 'Success', 'Resource deleted successfully.');
                router.push('/');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error.includes("Invalid `prisma.resource.delete()`")) {
                showToast('error', 'Error', 'Resource cannot be deleted because it is part of a course, delete the course first.');
            }
            else if (error.response && error.response.data && error.response.data.error) {
                showToast('error', 'Error', error.response.data.error);
            } else {
                showToast('error', 'Error', 'Failed to delete resource. Please try again.');
            }
        }
    }

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

    const renderContent = () => {
        if (decryptedContent) {
            return <MDDisplay source={decryptedContent} />;
        }
        if (paidResource && !decryptedContent) {
            return <p className="text-center text-xl text-red-500">This content is paid and needs to be purchased before viewing.</p>;
        }
        if (processedEvent?.content) {
            return <MDDisplay source={processedEvent.content} />;
        }
        return null;
    }

    return (
        <div className='w-full px-24 pt-12 mx-auto mt-4 max-tab:px-0 max-mob:px-0 max-tab:pt-2 max-mob:pt-2'>
            <ResourceDetails 
                processedEvent={processedEvent}
                topics={processedEvent.topics}
                title={processedEvent.title}
                summary={processedEvent.summary}
                image={processedEvent.image}
                price={processedEvent.price}
                author={author}
                paidResource={paidResource}
                decryptedContent={decryptedContent}
                zapAmount={zapAmount}
                zapsLoading={zapsLoading}
                handlePaymentSuccess={handlePaymentSuccess}
                handlePaymentError={handlePaymentError}
            />
            {authorView && (
                <div className='w-[75vw] mx-auto flex flex-row justify-end mt-12'>
                    <div className='w-fit flex flex-row justify-between'>
                        <Button onClick={() => router.push(`/details/${processedEvent.id}/edit`)} label="Edit" severity='warning' outlined className="w-auto m-2" />
                        <Button onClick={handleDelete} label="Delete" severity='danger' outlined className="w-auto m-2 mr-0" />
                    </div>
                </div>
            )}
            {typeof window !== 'undefined' && nAddress !== null && (
                <div className='px-24'>
                    <ZapThreadsWrapper
                        anchor={nAddress}
                        user={user?.pubkey || null}
                        relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://nostr.mutinywallet.com/, wss://relay.mutinywallet.com/, wss://relay.primal.net/"
                        disable=""
                    />
                </div>
            )}
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {renderContent()}
            </div>
        </div>
    );
}
