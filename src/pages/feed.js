import React from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useQuery } from '@tanstack/react-query';

const fetchDiscordMessages = async () => {
    const response = await fetch('/api/discord-messages');
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    return response.json();
};

const Feed = () => {
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

    // Destructure messages from data
    // const messages = data?.messages || [];

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
        <div className="gap-4 p-4 bg-gray-900">
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
    );
};

export default Feed;