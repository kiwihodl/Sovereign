import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import CommunityMenuTab from '@/components/menutab/CommunityMenuTab';
import NostrFeed from './nostr';
import DiscordFeed from './discord';
import StackerNewsFeed from './stackernews';
import GlobalFeed from './global';
import { useRouter } from 'next/router';
const Feed = () => {
    const [selectedTopic, setSelectedTopic] = useState('global');
    const [searchQuery, setSearchQuery] = useState('');
    const allTopics = ['global', 'nostr', 'discord', 'stackernews'];

    const router = useRouter();

    const handleTopicChange = (topic) => {
        setSelectedTopic(topic);
        router.push(`/feed?channel=${topic}`);
    };

    // initialize the selected topic to the query parameter
    useEffect(() => {
        setSelectedTopic(router.query.channel);
    }, [router.query.channel]);

    return (
        <div className="bg-gray-900 h-full w-[100vw] min-bottom-bar:w-[87vw]">
            <div className="w-fit mx-4 pt-4 flex flex-col items-start">
                <h1 className="text-3xl font-bold mb-4 ml-1">Community</h1>
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