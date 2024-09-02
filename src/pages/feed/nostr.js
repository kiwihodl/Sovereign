import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { useDiscordQuery } from '@/hooks/communityQueries/useDiscordQuery';
import { useRouter } from 'next/router';
import CommunityMenuTab from '@/components/menutab/CommunityMenuTab';

const NostrFeed = () => {
    const [selectedTopic, setSelectedTopic] = useState('global');
    const [searchQuery, setSearchQuery] = useState('');
    const allTopics = ['global', 'nostr', 'discord', 'stackernews'];

    const router = useRouter();
    const { data, error, isLoading } = useDiscordQuery({page: router.query.page});

    const handleTopicChange = (topic) => {
        setSelectedTopic(topic);
    };

    if (isLoading) {
        return (
            <div className="h-[100vh] min-bottom-bar:w-[87vw] max-sidebar:w-[100vw]">
                <ProgressSpinner className='w-full mt-24 mx-auto' />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Failed to load messages. Please try again later.</div>;
    }

    const header = (message) => (
        <div className="flex flex-row w-full items-center justify-between p-4 bg-gray-800 rounded-t-lg">
            <div className="flex flex-row items-center">
                <Avatar image={message.avatar} shape="circle" size="large" className="border-2 border-blue-400" />
                <p className="pl-4 font-bold text-xl text-white">{message.author}</p>
            </div>
            <div className="flex flex-col items-start justify-between">
                <div className="flex flex-row w-full justify-between items-center my-1">
                    <Tag value={message.channel} severity="primary" className="w-fit text-[#f8f8ff] bg-gray-600 mr-2" />
                    <Tag icon="pi pi-discord" value="discord" className="w-fit text-[#f8f8ff] bg-blue-400" />
                </div>
            </div>
        </div>
    );

    const footer = (message) => (
        <div className="w-full flex justify-between items-center">
            <span className="bg-gray-800 rounded-lg p-2 text-sm text-gray-300">
                {new Date(message.timestamp).toLocaleString()}
            </span>
            <Button
                label="View in Discord"
                icon="pi pi-external-link"
                outlined
                size="small"
                className='my-2'
                onClick={() => window.open(`https://discord.com/channels/${message.channelId}/${message.id}`, '_blank')}
            />
        </div>
    );

    return (
        <div className="bg-gray-900 h-full w-full min-bottom-bar:w-[87vw]">
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
            <div className="mx-4 mt-4">
            {data && data.length > 0 ? (
                data.map(message => (
                    <Card
                    key={message.id}
                    header={() => header(message)}
                    footer={() => footer(message)}
                    className="w-full bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
                    >
                        <p className="m-0 text-lg text-gray-200">{message.content}</p>
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