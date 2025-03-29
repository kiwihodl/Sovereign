import React, { useState, useEffect, useCallback, useMemo } from "react";
import CommunityMessage from "@/components/feeds/messages/CommunityMessage";
import { parseMessageEvent } from "@/utils/nostr";
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNDKContext } from "@/context/NDKContext";
import useWindowWidth from "@/hooks/useWindowWidth";
import Image from "next/image";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import NostrIcon from '/public/images/nostr.png';
import { useImageProxy } from "@/hooks/useImageProxy";

const MessageDropdownItem = ({ message, onSelect }) => {
    const { ndk } = useNDKContext();
    const [messageData, setMessageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState(null);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth <= 600;
    const { returnImageProxy } = useImageProxy();

    // Stable reference to message to prevent infinite loops
    const messageRef = useMemo(() => message, [message?.id]);

    // Determine the platform once when component mounts or message changes
    const determinePlatform = useCallback(() => {
        if (messageRef?.channel) return "discord";
        if (messageRef?.kind) return "nostr";
        return "stackernews";
    }, [messageRef]);

    // Memoize the fetchNostrAuthor function
    const fetchNostrAuthor = useCallback(async (pubkey) => {
        if (!ndk || !pubkey) return null;
        
        try {
            await ndk.connect();
            const user = await ndk.getUser({ pubkey });
            const profile = await user.fetchProfile();
            
            // Return the parsed profile data directly - it already contains what we need
            return profile;
        } catch (error) {
            console.error("Error fetching Nostr author:", error);
            return null;
        }
    }, [ndk]);

    // Process message based on platform type
    useEffect(() => {
        // Prevent execution if no message data or already loaded
        if (!messageRef || messageData) return;

        const currentPlatform = determinePlatform();
        setPlatform(currentPlatform);
        
        let isMounted = true;
        
        const processMessage = async () => {
            try {
                if (currentPlatform === "nostr") {
                    // Format Nostr message
                    const parsedMessage = parseMessageEvent(messageRef);
                    
                    // Fetch author data for Nostr messages
                    let authorData = null;
                    if (messageRef?.pubkey) {
                        authorData = await fetchNostrAuthor(messageRef.pubkey);
                    }
                    
                    // Extract author details with fallbacks
                    const authorName = authorData?.name || authorData?.displayName || "Unknown User";
                    const authorPicture = authorData?.picture || authorData?.image || null;
                    
                    // Only update state if component is still mounted
                    if (isMounted) {
                        setMessageData({
                            ...parsedMessage,
                            timestamp: messageRef.created_at || Math.floor(Date.now() / 1000),
                            channel: "plebdevs",
                            author: authorName,
                            avatar: authorPicture,
                            avatarProxy: authorPicture ? returnImageProxy(authorPicture) : null,
                            type: "nostr",
                            id: messageRef.id
                        });
                    }
                    
                } else if (currentPlatform === "discord") {
                    const avatarUrl = messageRef?.author?.avatar 
                        ? `https://cdn.discordapp.com/avatars/${messageRef.author.id}/${messageRef.author.avatar}.png`
                        : null;
                    
                    if (isMounted) {
                        setMessageData({
                            content: messageRef?.content,
                            author: messageRef?.author?.username || "Unknown User",
                            timestamp: messageRef?.timestamp ? Math.floor(messageRef.timestamp / 1000) : Math.floor(Date.now() / 1000),
                            avatar: avatarUrl,
                            avatarProxy: avatarUrl ? returnImageProxy(avatarUrl) : null,
                            channel: messageRef?.channel || "discord",
                            type: "discord",
                            id: messageRef.id
                        });
                    }
                    
                } else if (currentPlatform === "stackernews") {
                    if (isMounted) {
                        setMessageData({
                            content: messageRef?.title,
                            author: messageRef?.user?.name || "Unknown User",
                            timestamp: messageRef?.created_at ? Math.floor(Date.parse(messageRef.created_at) / 1000) : Math.floor(Date.now() / 1000),
                            avatar: "https://pbs.twimg.com/profile_images/1403162883941359619/oca7LMQ2_400x400.png",
                            avatarProxy: returnImageProxy("https://pbs.twimg.com/profile_images/1403162883941359619/oca7LMQ2_400x400.png"),
                            channel: "~devs",
                            type: "stackernews",
                            id: messageRef.id
                        });
                    }
                }
            } catch (error) {
                console.error("Error processing message:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        processMessage();
        
        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [messageRef, determinePlatform, fetchNostrAuthor, returnImageProxy, messageData]);

    const getPlatformIcon = useCallback(() => {
        switch (platform) {
            case 'nostr':
                return <Image src={NostrIcon} alt="Nostr" width={16} height={16} className="mr-1" />;
            case 'discord':
                return <i className="pi pi-discord mr-1" />;
            case 'stackernews':
                return <i className="pi pi-bolt mr-1" />;
            default:
                return <i className="pi pi-globe mr-1" />;
        }
    }, [platform]);

    // Create a simplified view for mobile search results
    const renderSimplifiedMessage = useCallback(() => {
        if (!messageData) return null;
        
        const authorName = messageData.author || "Unknown User";
        const avatarUrl = messageData.avatarProxy || returnImageProxy(messageData.avatar);
        const messageDate = messageData.timestamp ? formatTimestampToHowLongAgo(messageData.timestamp) : '';
        
        return (
            <div className="flex flex-col">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 mt-1">
                        {avatarUrl ? (
                            <Image 
                                src={avatarUrl} 
                                alt="avatar" 
                                width={40} 
                                height={40} 
                                className="object-cover w-full h-full" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <i className="pi pi-user text-gray-400 text-xl" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-[#f8f8ff]">
                                {authorName}
                            </div>
                            <div className="text-xs text-gray-400">
                                {messageDate}
                            </div>
                        </div>
                        <p className="text-neutral-50/90 whitespace-pre-wrap mb-3 line-clamp-3">{messageData.content}</p>
                        
                        <div className="flex flex-wrap gap-2">
                            <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center">
                                {getPlatformIcon()}
                                {platform}
                            </div>
                            <div className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm">
                                plebdevs
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [messageData, returnImageProxy, getPlatformIcon, platform]);

    // Memoize the final message object to pass to CommunityMessage
    const finalMessage = useMemo(() => {
        if (!messageData) return null;
        return {
            ...messageData,
            avatar: messageData?.avatarProxy || returnImageProxy(messageData?.avatar)
        };
    }, [messageData, returnImageProxy]);

    return (
        <div 
            className="px-6 py-6 border-b border-gray-700 cursor-pointer" 
            onClick={() => !loading && onSelect(messageData || messageRef)}
        >
            {loading ? (
                <div className='w-full h-[100px] flex items-center justify-center'>
                    <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
                </div>
            ) : (
                isMobile ? renderSimplifiedMessage() : 
                <CommunityMessage 
                    message={finalMessage}
                    platform={platform} 
                />
            )}
        </div>
    );
};

export default MessageDropdownItem;