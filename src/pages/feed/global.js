import React from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDiscordQuery } from '@/hooks/communityQueries/useDiscordQuery';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';

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

    if (discordLoading || stackerNewsLoading) {
        return (
            <div className="h-[100vh] min-bottom-bar:w-[87vw] max-sidebar:w-[100vw]">
                <ProgressSpinner className='w-full mt-24 mx-auto' />
            </div>
        );
    }

    if (discordError || stackerNewsError) {
        return <div className="text-red-500 text-center p-4">Failed to load feed. Please try again later.</div>;
    }

    const combinedFeed = [
        ...(discordData || []).map(item => ({ ...item, type: 'discord' })),
        ...(stackerNewsData || []).map(item => ({ ...item, type: 'stackernews' }))
    ].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

    const header = (item) => (
        <div className="flex flex-row w-full items-center justify-between p-4 bg-gray-800 rounded-t-lg">
            <div className="flex flex-row items-center">
                <Avatar image={item.type === 'discord' ? item.avatar : null} icon={item.type === 'stackernews' ? "pi pi-user" : null} shape="circle" size="large" className="border-2 border-blue-400" />
                <p className="pl-4 font-bold text-xl text-white">{item.type === 'discord' ? item.author : item.user.name}</p>
            </div>
            <div className="flex flex-col items-start justify-between">
                <div className="flex flex-row w-full justify-between items-center my-1 max-sidebar:flex-col max-sidebar:items-start">
                    {item.type === 'discord' ? (
                        <>
                            <Tag value={item.channel} severity="primary" className="w-fit text-[#f8f8ff] bg-gray-600 mr-2 max-sidebar:mr-0" />
                            <Tag icon="pi pi-discord" value="discord" className="w-fit text-[#f8f8ff] bg-blue-400 max-sidebar:mt-1" />
                        </>
                    ) : (
                        <>
                            <Tag value="~devs" severity="contrast" className="w-fit text-[#f8f8ff] mr-2 max-sidebar:mr-0" />
                            <Tag icon={<StackerNewsIconComponent />} value="stackernews" className="w-fit bg-gray-600 text-[#f8f8ff] max-sidebar:mt-1" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const footer = (item) => (
        <div className="w-full flex justify-between items-center">
            <span className="bg-gray-800 rounded-lg p-2 text-sm text-gray-300">
                {new Date(item.timestamp || item.createdAt).toLocaleString()}
            </span>
            <Button
                label={item.type === 'discord' ? "View in Discord" : "View on StackerNews"}
                icon="pi pi-external-link"
                outlined
                severity={item.type === 'discord' ? "info" : "warning"}
                size="small"
                className='my-2'
                onClick={() => window.open(item.type === 'discord' ? 
                    `https://discord.com/channels/${item.channelId}/${item.id}` : 
                    `https://stacker.news/items/${item.id}`, '_blank')}
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
                        {item.type === 'discord' ? (
                            <p className="m-0 text-lg text-gray-200">{item.content}</p>
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