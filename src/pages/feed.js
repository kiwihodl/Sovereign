import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CommunityMenuTab from '@/components/menutab/CommunityMenuTab';
import NostrFeed from '@/components/feeds/NostrFeed';
import DiscordFeed from '@/components/feeds/DiscordFeed';
import StackerNewsFeed from '@/components/feeds/StackerNewsFeed';
import GlobalFeed from '@/components/feeds/GlobalFeed';
import { useRouter } from 'next/router';
import MessageInput from '@/components/feeds/MessageInput';
import StackerNewsIcon from '../../public/images/sn.svg';
import NostrIcon from '../../public/images/nostr.png';
import GenericButton from '@/components/buttons/GenericButton';
import { Divider } from 'primereact/divider';

const Feed = () => {
    const [selectedTopic, setSelectedTopic] = useState('global');
    const [title, setTitle] = useState('Community');
    const allTopics = ['global', 'nostr', 'discord', 'stackernews'];

    const router = useRouter();

    const handleTopicChange = (topic) => {
        setSelectedTopic(topic);
        router.push(`/feed?channel=${topic}`);
    };

    useEffect(() => {
        setTitle(router.query.channel);
    }, [router.query.channel]);

    useEffect(() => {
        setSelectedTopic(router.query.channel);
    }, [router.query.channel]);

    const getTagIcon = (topic) => {
        switch (topic) {
            case 'global':
                return 'pi pi-globe';
            case 'nostr':
                return <Image src={NostrIcon} alt="Nostr" width={18} height={18} className='mr-1' />;
            case 'discord':
                return 'pi pi-discord';
            case 'stackernews':
                return <Image src={StackerNewsIcon} alt="StackerNews" width={20} height={20} className='mr-1' />;
            default:
                return 'pi pi-globe';
        }
    };

    return (
        <div className="w-full mx-auto px-10">
            <div className="mb-2">
                <div className='flex flex-col'>
                    <div className='my-4 flex flex-row items-end'>
                        <h1 className="font-bold mb-0">Feeds</h1>
                        <GenericButton
                            icon={getTagIcon(title)}
                            className='ml-2 text-sm p-2 py-1 flex items-center cursor-default hover:bg-transparent'
                            outlined
                            severity={{
                                'global': 'success',
                                'discord': 'primary',
                                'stackernews': 'warning',
                                'nostr': 'help'
                            }[title] || 'info'}
                            label={`${title}`}
                        />
                    </div>
                    {selectedTopic === 'nostr' && (
                        <div className='w-full mt-2'>
                            <MessageInput />
                        </div>
                    )}
                </div>
                <Divider />
            </div>
            <CommunityMenuTab
                items={allTopics}
                selectedTopic={selectedTopic}
                onTabChange={handleTopicChange}
                className="mb-4"
            />
            <div className="feed-content">
                {selectedTopic === 'global' && <GlobalFeed />}
                {selectedTopic === 'nostr' && <NostrFeed />}
                {selectedTopic === 'discord' && <DiscordFeed />}
                {selectedTopic === 'stackernews' && <StackerNewsFeed />}
            </div>
        </div>
    );
};

export default Feed;