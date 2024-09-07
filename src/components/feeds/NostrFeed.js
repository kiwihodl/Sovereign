import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNDKContext } from '@/context/NDKContext';
import { useSession } from 'next-auth/react';
import { findKind0Fields } from '@/utils/nostr';
import NostrIcon from '../../../public/images/nostr.png';
import Image from 'next/image';
import { useImageProxy } from '@/hooks/useImageProxy';
import { nip19 } from 'nostr-tools';
import { useCommunityNotes } from '@/hooks/nostr/useCommunityNotes';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';

const NostrFeed = () => {
    const { communityNotes, isLoading, error } = useCommunityNotes();
    const { ndk } = useNDKContext();
    const { returnImageProxy } = useImageProxy();
    const { data: session } = useSession();
    const [authorData, setAuthorData] = useState({});
    const [npub, setNpub] = useState(null);

    useEffect(() => {
        const fetchAuthors = async () => {
            const authorDataMap = {};
            for (const message of communityNotes) {
                if (!authorDataMap[message.pubkey]) {
                    const author = await fetchAuthor(message.pubkey);
                    authorDataMap[message.pubkey] = author;
                }
            }
            setAuthorData(authorDataMap);
        };

        if (communityNotes && communityNotes.length > 0) {
            fetchAuthors();
        }
    }, [communityNotes]);

    useEffect(() => {
        if (session?.user?.pubkey) {
            setNpub(nip19.npubEncode(session.user.pubkey));
        }
    }, [session]);

    const fetchAuthor = async (pubkey) => {
        try {
            const filter = {
                kinds: [0],
                authors: [pubkey]
            };

            const author = await ndk.fetchEvent(filter);
            if (author) {
                try {
                    const fields = await findKind0Fields(JSON.parse(author.content));
                    return fields;
                } catch (error) {
                    console.error('Error fetching author:', error);
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching author:', error);
        }
    };

    const getAvatarImage = (message) => {
        return authorData[message.pubkey]?.avatar ? returnImageProxy(authorData[message.pubkey]?.avatar) : null;
    };

    const renderHeader = (message) => (
        <div className="flex flex-row w-full items-center justify-between p-4 bg-gray-800 rounded-t-lg">
            <div className="flex flex-row items-center">
                <Avatar
                    image={getAvatarImage(message)}
                    icon={getAvatarImage(message) ? null : 'pi pi-user'}
                    shape="circle"
                    size="large"
                    className="border-2 border-blue-400"
                />
                <p className="pl-4 font-bold text-xl text-white">
                    {authorData[message.pubkey]?.username || message.pubkey.substring(0, 12) + '...'}
                </p>
            </div>
            <div className="flex flex-col items-start justify-between">
                <div className="flex flex-row w-full justify-between items-center my-1 max-sidebar:flex-col max-sidebar:items-start">
                    <Tag icon="pi pi-hashtag" value="plebdevs" severity="primary" className="w-fit text-[#f8f8ff] bg-gray-600 mr-2 max-sidebar:mr-0" />
                    <Tag icon={<Image src={NostrIcon} alt="Nostr" width={14} height={14} className='mr-[1px]' />} value="nostr" className="w-fit text-[#f8f8ff] bg-blue-400 max-sidebar:mt-1" />
                </div>
            </div>
        </div>
    );

    const footer = (message) => (
        <>
            <div className="w-full flex justify-between items-center">
                <span className="bg-gray-800 rounded-lg p-2 text-sm text-gray-300">
                    {new Date(message.created_at * 1000).toLocaleString()}
                </span>
                <Button
                    label="View on Nostr"
                    icon="pi pi-external-link"
                    outlined
                    size="small"
                    className='my-2'
                    onClick={() => window.open(`https://nostr.band/${nip19.noteEncode(message.id)}`, '_blank')}
                />
            </div>
            <div className="w-full">
                {session?.user?.pubkey && (
                    <ZapThreadsWrapper
                        anchor={nip19.noteEncode(message.id)}
                        user={npub}
                        relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://nostr.mutinywallet.com/, wss://relay.mutinywallet.com/, wss://relay.primal.net/"
                        disable=""
                    />
                )}
            </div>
        </>
    );

    if (isLoading) {
        return (
            <div className="h-[100vh] min-bottom-bar:w-[86vw] max-sidebar:w-[100vw]">
                <ProgressSpinner className='w-full mt-24 mx-auto' />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Failed to load messages. Please try again later.</div>;
    }

    return (
        <div className="bg-gray-900 h-full w-full min-bottom-bar:w-[86vw]">
            <div className="mx-4 mt-4">
                {communityNotes.length > 0 ? (
                    communityNotes.map(message => (
                        <Card
                            key={message.id}
                            header={renderHeader(message)}
                            footer={() => footer(message)}
                            className="w-full bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
                        >
                            <p className="m-0 text-lg text-gray-200 overflow-hidden break-words">{message.content}</p>
                        </Card>
                    ))
                ) : (
                    <div className="text-gray-400 text-center p-4">No messages available.</div>
                )}
            </div>
        </div>
    );
};

export default NostrFeed;