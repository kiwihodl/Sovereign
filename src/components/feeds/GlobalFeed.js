import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDiscordQuery } from '@/hooks/communityQueries/useDiscordQuery';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useCommunityNotes } from '@/hooks/nostr/useCommunityNotes';
import { useNDKContext } from '@/context/NDKContext';
import { findKind0Fields } from '@/utils/nostr';
import NostrIcon from '../../../public/images/nostr.png';
import Image from 'next/image';
import { useImageProxy } from '@/hooks/useImageProxy';
import { nip19 } from 'nostr-tools';

const StackerNewsIconComponent = () => (
    <svg width="16" height="16" className='mr-2' viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#facc15" fillRule="evenodd" d="m41.7 91.4 41.644 59.22-78.966 69.228L129.25 155.94l-44.083-58.14 54.353-65.441Z"/>
        <path fill="#facc15" fillRule="evenodd" d="m208.355 136.74-54.358-64.36-38.4 128.449 48.675-74.094 64.36 65.175L251.54 42.497Z"/>
    </svg>
);

const fetchStackerNews = async () => {
    const response = await axios.get('/api/stackernews');
    return response.data.data.items.items;
};

const GlobalFeed = () => {
    const router = useRouter();
    const { data: discordData, error: discordError, isLoading: discordLoading } = useDiscordQuery({page: router.query.page});
    const { data: stackerNewsData, error: stackerNewsError, isLoading: stackerNewsLoading } = useQuery({queryKey: ['stackerNews'], queryFn: fetchStackerNews});
    const { communityNotes: nostrData, error: nostrError, isLoading: nostrLoading } = useCommunityNotes();
    const { ndk } = useNDKContext();
    const { returnImageProxy } = useImageProxy();

    const [authorData, setAuthorData] = useState({});

    useEffect(() => {
        const fetchAuthors = async () => {
            const authorDataMap = {};
            for (const message of nostrData) {
                const author = await fetchAuthor(message.pubkey);
                authorDataMap[message.pubkey] = author;
            }
            setAuthorData(authorDataMap);
        };

        if (nostrData && nostrData.length > 0) {
            fetchAuthors();
        }
    }, [nostrData]);

    const fetchAuthor = async (pubkey) => {
        try {
            await ndk.connect();

            const filter = {
                kinds: [0],
                authors: [pubkey]
            }

            const author = await ndk.fetchEvent(filter);
            if (author) {
                try {
                    const fields = await findKind0Fields(JSON.parse(author.content));
                    return fields;
                } catch (error) {
                    console.error('Error fetching author:', error);
                }
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching author:', error);
        }
    }

    if (discordLoading || stackerNewsLoading || nostrLoading) {
        return (
            <div className="h-[100vh] min-bottom-bar:w-[87vw] max-sidebar:w-[100vw]">
                <ProgressSpinner className='w-full mt-24 mx-auto' />
            </div>
        );
    }

    if (discordError || stackerNewsError || nostrError) {
        return <div className="text-red-500 text-center p-4">Failed to load feed. Please try again later.</div>;
    }

    const getAvatarImage = (item) => {
        if (item.type === 'discord') {
            return item.avatar ? returnImageProxy(item.avatar) : null;
        } else if (item.type === 'nostr') {
            return authorData[item.pubkey]?.avatar ? returnImageProxy(authorData[item.pubkey]?.avatar) : null;
        } else if (item.type === 'stackernews') {
            return item.user.image ? returnImageProxy(item.user.image) : null;
        }
        return null;
    };

    const combinedFeed = [
        ...(discordData || []).map(item => ({ ...item, type: 'discord' })),
        ...(stackerNewsData || []).map(item => ({ ...item, type: 'stackernews' })),
        ...(nostrData || []).map(item => ({ ...item, type: 'nostr' }))
    ].sort((a, b) => {
        const dateA = a.type === 'nostr' ? a.created_at * 1000 : new Date(a.timestamp || a.createdAt);
        const dateB = b.type === 'nostr' ? b.created_at * 1000 : new Date(b.timestamp || b.createdAt);
        return dateB - dateA;
    });

    const header = (item) => (
        <div className="flex flex-row w-full items-center justify-between p-4 bg-gray-800 rounded-t-lg">
            <div className="flex flex-row items-center">
                <Avatar 
                    image={getAvatarImage(item)}
                    icon={item.type === 'stackernews' ? "pi pi-user" : null} 
                    shape="circle" 
                    size="large" 
                    className="border-2 border-blue-400" 
                />
                <p className="pl-4 font-bold text-xl text-white">
                    {item.type === 'discord' ? item.author : 
                     item.type === 'stackernews' ? item.user.name :
                     authorData[item.pubkey]?.username || item.pubkey.substring(0, 12) + '...'}
                </p>
            </div>
            <div className="flex flex-col items-start justify-between">
                <div className="flex flex-row w-full justify-between items-center my-1 max-sidebar:flex-col max-sidebar:items-start">
                    {item.type === 'discord' && (
                        <>
                            <Tag value={item.channel} severity="primary" className="w-fit text-[#f8f8ff] bg-gray-600 mr-2 max-sidebar:mr-0" />
                            <Tag icon="pi pi-discord" value="discord" className="w-fit text-[#f8f8ff] bg-blue-400 max-sidebar:mt-1" />
                        </>
                    )}
                    {item.type === 'stackernews' && (
                        <>
                            <Tag value="~devs" severity="contrast" className="w-fit text-[#f8f8ff] mr-2 max-sidebar:mr-0" />
                            <Tag icon={<StackerNewsIconComponent />} value="stackernews" className="w-fit bg-gray-600 text-[#f8f8ff] max-sidebar:mt-1" />
                        </>
                    )}
                    {item.type === 'nostr' && (
                        <>
                            <Tag icon="pi pi-hashtag" value="plebdevs" severity="primary" className="w-fit text-[#f8f8ff] bg-gray-600 mr-2 max-sidebar:mr-0" />
                            <Tag icon={<Image src={NostrIcon} alt="Nostr" width={14} height={14} className='mr-[1px]' />} value="nostr" className="w-fit text-[#f8f8ff] bg-blue-400 max-sidebar:mt-1" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const footer = (item) => (
        <div className="w-full flex justify-between items-center">
            <span className="bg-gray-800 rounded-lg p-2 text-sm text-gray-300">
                {item.type === 'nostr' 
                    ? new Date(item.created_at * 1000).toLocaleString()
                    : new Date(item.timestamp || item.createdAt).toLocaleString()}
            </span>
            <Button
                label={item.type === 'discord' ? "View in Discord" : 
                       item.type === 'stackernews' ? "View on StackerNews" : 
                       "View on Nostr"}
                icon="pi pi-external-link"
                outlined
                severity={item.type === 'discord' ? "info" : 
                          item.type === 'stackernews' ? "warning" : 
                          "success"}
                size="small"
                className='my-2'
                onClick={() => window.open(
                    item.type === 'discord' ? `https://discord.com/channels/${item.channelId}/${item.id}` : 
                    item.type === 'stackernews' ? `https://stacker.news/items/${item.id}` :
                    `https://nostr.band/${nip19.noteEncode(item.id)}`, 
                    '_blank'
                )}
            />
        </div>
    );

    return (
        <div className="bg-gray-900 h-full w-full min-bottom-bar:w-[87vw]">
            <div className="mx-4 mt-4">
            {combinedFeed.length > 0 ? (
                combinedFeed.map(item => (
                    <Card
                    key={item.id}
                    header={() => header(item)}
                    footer={() => footer(item)}
                    className="w-full bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
                    >
                        {item.type === 'discord' || item.type === 'nostr' ? (
                            <p className="m-0 text-lg text-gray-200 overflow-hidden break-words">{item.content}</p>
                        ) : (
                            <>
                                <h3 className="m-0 text-lg text-gray-200">{item.title}</h3>
                                <p className="text-sm text-gray-400">
                                    Comments: {item.comments.length} | Sats: {item.sats}
                                </p>
                            </>
                        )}
                    </Card>
                ))
            ) : (
                <div className="text-gray-400 text-center p-4">No items available.</div>
            )}
            </div>
        </div>
    );
};

export default GlobalFeed;