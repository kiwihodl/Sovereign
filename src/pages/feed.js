import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import CommunityMenuTab from '@/components/menutab/CommunityMenuTab';
import NostrFeed from '@/components/feeds/NostrFeed';
import DiscordFeed from '@/components/feeds/DiscordFeed';
import StackerNewsFeed from '@/components/feeds/StackerNewsFeed';
import GlobalFeed from '@/components/feeds/GlobalFeed';
import { useRouter } from 'next/router';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import StackerNewsIcon from '../../public/sn.svg';
import NostrIcon from '../../public/nostr.png';

const Feed = () => {
    const [selectedTopic, setSelectedTopic] = useState('global');
    const [searchQuery, setSearchQuery] = useState('');
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

    // initialize the selected topic to the query parameter
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
        <div className="bg-gray-900 h-full w-[100vw] min-bottom-bar:w-[87vw]">
            <div className="w-fit mx-4 pt-4 flex flex-col items-start">
                <div className='mb-4 flex flex-row items-center'>
                    <h1 className="text-3xl font-bold ml-1">Community</h1>
                    <Tag 
                        icon={getTagIcon(title)}
                        className='ml-2 text-sm p-2 text-[#f8f8ff] flex items-center'
                        severity={{
                            'global': 'success',
                            'discord': 'primary',
                            'stackernews': 'warning',
                            'nostr': 'info'
                        }[title] || 'info'}
                        value={`${title}`} 
                    />
                </div>
                <InputText
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    icon="pi pi-search"
                    className="w-full mb-2"
                />
            </div>
            <div className="min-bottom-bar:hidden">
                <CommunityMenuTab
                    items={allTopics}
                    selectedTopic={selectedTopic}
                    onTabChange={handleTopicChange}
                    className="max-w-[90%] mx-auto"
                />
            </div>
            {
                selectedTopic === 'global' && <GlobalFeed />
            }
            {
                selectedTopic === 'nostr' && <NostrFeed />
            }
            {
                selectedTopic === 'discord' && <DiscordFeed />
            }
            {
                selectedTopic === 'stackernews' && <StackerNewsFeed />
            }
        </div>
    );
};

export default Feed;