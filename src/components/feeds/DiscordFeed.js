import React, { useMemo } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDiscordQuery } from '@/hooks/communityQueries/useDiscordQuery';
import { useRouter } from 'next/router';
import CommunityMessage from '@/components/feeds/messages/CommunityMessage';
import useWindowWidth from '@/hooks/useWindowWidth';

const DiscordFeed = ({ searchQuery }) => {
    const router = useRouter();
    const { data, error, isLoading } = useDiscordQuery({page: router.query.page});
    const windowWidth = useWindowWidth();

    // Memoize the filtered data
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data
            .filter(message =>
                message.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [data, searchQuery]);

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
        <div className="h-full w-full min-bottom-bar:w-[86vw]">
            <div className="mx-4">
            {filteredData.length > 0 ? (
                filteredData.map(message => (
                    <CommunityMessage
                        key={message.id}
                        message={message}
                        searchQuery={searchQuery}
                        windowWidth={windowWidth}
                        platform="discord"
                    />
                ))
            ) : (
                <div className="text-gray-400 text-center p-4">No messages available.</div>
            )}
            </div>
        </div>
    );
};

export default DiscordFeed;