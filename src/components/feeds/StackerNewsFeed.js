import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import CommunityMessage from '@/components/feeds/messages/CommunityMessage';
import useWindowWidth from '@/hooks/useWindowWidth';

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

const StackerNewsFeed = ({ searchQuery }) => {
    const { data: items, isLoading, error } = useQuery({queryKey: ['stackerNews'], queryFn: fetchStackerNews});
    const windowWidth = useWindowWidth();

    if (isLoading) {
        return (
            <div className="h-[100vh] min-bottom-bar:w-[86vw] max-sidebar:w-[100vw]">
                <ProgressSpinner className='w-full mt-24 mx-auto' />
            </div>
        );
    }

    if (error) {
        console.error('Error fetching Stacker News:', error);
        return <div className="text-red-500 text-center p-4">Error loading data. Please try again later.</div>;
    }

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-gray-900 h-full w-full min-bottom-bar:w-[86vw]">
            <div className="mx-4 mt-4">
                {filteredItems && filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <CommunityMessage
                            key={item.id}
                            message={{
                                id: item.id,
                                author: item.user.name,
                                avatar: item.user.image,
                                content: item.title,
                                timestamp: item.createdAt,
                                channel: "~devs",
                                additionalContent: `Comments: ${item.comments.length} | Sats: ${item.sats}`
                            }}
                            searchQuery={searchQuery}
                            windowWidth={windowWidth}
                            platform="stackernews"
                            platformIcon={<StackerNewsIconComponent />}
                            platformLink={`https://stacker.news/items/${item.id}`}
                        />
                    ))
                ) : (
                    <div className="text-gray-400 text-center p-4">No items available.</div>
                )}
            </div>
        </div>
    );
};

export default StackerNewsFeed;