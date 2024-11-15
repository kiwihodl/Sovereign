import React, { useState, useCallback, useEffect } from "react";
import DocumentDetails from "@/components/content/documents/DocumentDetails";
import VideoDetails from "@/components/content/videos/VideoDetails";
import { parseEvent, findKind0Fields } from '@/utils/nostr';
import { nip19 } from 'nostr-tools';
import { useSession } from 'next-auth/react';
import { useNDKContext } from "@/context/NDKContext";
import { useDecryptContent } from "@/hooks/encryption/useDecryptContent";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/router";
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import appConfig from "@/config/appConfig";

const Details = () => {
    const [event, setEvent] = useState(null);
    const [author, setAuthor] = useState(null);
    const [nAddress, setNAddress] = useState(null);
    const [decryptedContent, setDecryptedContent] = useState(null);
    const [authorView, setAuthorView] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState([]);
    const [npub, setNpub] = useState(null);
    const [nsec, setNsec] = useState(null);
    const { data: session, update } = useSession();
    const { ndk } = useNDKContext();
    const { decryptContent } = useDecryptContent();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const res = await axios.get('/api/lessons');
                if (res.data) {
                    const lessonData = res.data.map(lesson => ({
                        resourceId: lesson?.resourceId,
                        courseId: lesson?.courseId || null
                    }));
                    setLessons(lessonData);
                }
            } catch (err) {
                console.error('err', err);
            }
        };
        fetchLessons();
    }, []);

    const fetchAuthor = useCallback(async (pubkey) => {
        if (!pubkey) return;
        const author = await ndk.getUser({ pubkey });
        const profile = await author.fetchProfile();
        const fields = await findKind0Fields(profile);
        if (fields) {
            setAuthor(fields);
        }
    }, [ndk]);

    useEffect(() => {
        if (event?.d && !nAddress) {
            const naddr = nip19.naddrEncode({
                pubkey: event.pubkey,
                kind: event.kind,
                identifier: event.d,
                relayUrls: appConfig.defaultRelayUrls
            });
            setNAddress(naddr);
        }
    }, [event, nAddress]);

    useEffect(() => {
        if (!author && event?.pubkey) {
            fetchAuthor(event?.pubkey);
        }
    }, [author, event, fetchAuthor]);

    useEffect(() => {
        if (session?.user?.privkey) {
            const privkeyBuffer = Buffer.from(session.user.privkey, 'hex');
            setNsec(nip19.nsecEncode(privkeyBuffer));
        } else if (session?.user?.pubkey) {
            setNpub(nip19.npubEncode(session.user.pubkey));
        }
    }, [session]);

    useEffect(() => {
        const fetchAndProcessEvent = async () => {
            if (!router.isReady || !router.query.slug) return;

            const { slug } = router.query;
            let id;

            if (slug.includes("naddr")) {
                const { data } = nip19.decode(slug);
                if (!data) {
                    showToast('error', 'Error', 'Resource not found');
                    setLoading(false);
                    return;
                }
                id = data?.identifier;
                setNAddress(slug);
            } else {
                id = slug;
            }

            try {
                await ndk.connect();
                const event = await ndk.fetchEvent({ ids: [id] });

                if (event) {
                    const parsedEvent = parseEvent(event);
                    setEvent(parsedEvent);
                    await fetchAuthor(event.pubkey);
                    setAuthorView(session?.user?.pubkey === event.pubkey);
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                showToast('error', 'Error', 'Failed to fetch event. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessEvent();
    }, [router.isReady, router.query, ndk, session?.user?.pubkey, fetchAuthor, showToast]);

    useEffect(() => {
        const handleDecryption = async () => {
            if (!event || !session || !lessons.length) return;

            const isAuthor = session?.user?.pubkey === event.pubkey;
            
            if (event.price || (isAuthor && event.kind === 30402)) {
                const shouldDecrypt = isAuthor ||
                    session?.user?.role?.subscribed ||
                    session?.user?.purchased?.some(purchase => purchase.resourceId === event.d) ||
                    lessons.some(lesson => 
                        lesson.resourceId === event.d && 
                        session?.user?.purchased?.some(purchase => 
                            purchase.courseId === lesson.courseId
                        )
                    );

                if (shouldDecrypt) {
                    const decrypted = await decryptContent(event.content);
                    setDecryptedContent(decrypted);
                }
            }
        };

        handleDecryption();
    }, [event, session, lessons, decryptContent]);

    const handlePaymentSuccess = (response) => {
        if (response && response?.preimage) {
            update();
        } else {
            showToast('error', 'Error', 'Failed to purchase resource. Please try again.');
        }
    }

    const handlePaymentError = (error) => {
        showToast('error', 'Payment Error', `Failed to purchase resource. Please try again. Error: ${error}`);
    }

    if (loading) {
        return <div className='w-full h-full flex items-center justify-center mt-24'><ProgressSpinner /></div>
    }

    if (!author || !event) return null;

    const DetailComponent = event.type === "document" ? DocumentDetails : VideoDetails;

    return (
        <>
            <DetailComponent
                processedEvent={event}
                topics={event.topics}
                title={event.title}
                summary={event.summary}
                image={event.image}
                price={event.price}
                author={author}
                paidResource={!!event.price}
                isLesson={lessons.some(lesson => lesson.resourceId === event.d)}
                nAddress={nAddress}
                decryptedContent={decryptedContent}
                handlePaymentSuccess={handlePaymentSuccess}
                handlePaymentError={handlePaymentError}
                authorView={authorView}
            />
            {nAddress !== null && (nsec || npub) && (
                <div className='px-4'>
                    <ZapThreadsWrapper
                        anchor={nAddress}
                        user={nsec || npub || null}
                        relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://relay.mutinywallet.com/, wss://relay.primal.net/, wss://nostr21.com/, wss://nostrue.com/, wss://purplerelay.com/, wss://relay.devs.tools/"
                        disable="zaps"
                    />
                </div>
            )}
        </>
    );
};

export default Details;
