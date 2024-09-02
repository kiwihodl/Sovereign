import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useQuery } from '@tanstack/react-query';
import { TabMenu } from 'primereact/tabmenu';
import { InputText } from 'primereact/inputtext';

const MenuTab = ({ items, selectedTopic, onTabChange }) => {
    const allItems = ['global', 'nostr', 'discord', 'stackernews'];

    const menuItems = allItems.map((item, index) => {
        let icon = 'pi pi-tag';

        return {
            label: (
                <Button
                    className={`${selectedTopic === item ? 'bg-primary text-white' : ''}`}
                    onClick={() => onTabChange(item)}
                    outlined={selectedTopic !== item}
                    rounded
                    size='small'
                    label={item}
                    icon={icon}
                />
            ),
            command: () => onTabChange(item)
        };
    });

    return (
        <div className="w-full">
            <TabMenu
                model={menuItems}
                activeIndex={allItems.indexOf(selectedTopic)}
                onTabChange={(e) => onTabChange(allItems[e.index])}
                pt={{
                    menu: { className: 'bg-transparent border-none ml-2 my-4' },
                    action: ({ context, parent }) => ({
                        className: 'cursor-pointer select-none flex items-center relative no-underline overflow-hidden border-b-2 p-2 font-bold rounded-t-lg',
                        style: { top: '2px' }
                    }),
                    menuitem: { className: 'mr-0' }
                }}
            />
        </div>
    );
}

const fetchDiscordMessages = async () => {
    const response = await fetch('/api/discord-messages');
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    return response.json();
};

const Feed = () => {
    const [selectedTopic, setSelectedTopic] = useState('global');
    const [searchQuery, setSearchQuery] = useState('');
    const allTopics = ['global', 'nostr', 'discord', 'stackernews'];

    const handleTopicChange = (topic) => {
        setSelectedTopic(topic);
    };

    const { data, error, isLoading } = useQuery({
        queryKey: ['discordMessages'],
        queryFn: fetchDiscordMessages,
        staleTime: 60000, // 1 minute
        refetchInterval: 60000, // Refetch every minute
    });

    if (isLoading) {
        return <ProgressSpinner className="w-full mx-auto" />
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
                <MenuTab
                    items={allTopics}
                    selectedTopic={selectedTopic}
                    onTabChange={handleTopicChange}
                    className="max-w-[90%] mx-auto"
                />
            </div>
            <div className="mx-4 mt-4">
            {data && data.map(message => (
                <Card
                key={message.id}
                header={() => header(message)}
                footer={() => footer(message)}
                className="w-full bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
                >
                    <p className="m-0 text-lg text-gray-200">{message.content}</p>
                </Card>
            ))}
            </div>
        </div>
    );
};

export default Feed;