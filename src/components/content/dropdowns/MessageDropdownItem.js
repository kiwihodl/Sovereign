import React, { useState, useEffect } from "react";
import CommunityMessage from "@/components/feeds/messages/CommunityMessage";
import { parseMessageEvent, findKind0Fields } from "@/utils/nostr";
import { useNDKContext } from "@/context/NDKContext";

const MessageDropdownItem = ({ message, onSelect }) => {
    const { ndk, addSigner } = useNDKContext();
    const [author, setAuthor] = useState(null);
    const [formattedMessage, setFormattedMessage] = useState(null);
    const [messageWithAuthor, setMessageWithAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState(null);

    const determinePlatform = () => {
        if (message?.channel) {
            return "discord";
        } else if (message?.kind) {
            return "nostr";
        } else {
            return "stackernews";
        }
    }

    useEffect(() => {
        setPlatform(determinePlatform(message));
    }, [message]);

    useEffect(() => {
        if (platform === "nostr") {
            const event = parseMessageEvent(message);
            setFormattedMessage(event);

            const getAuthor = async () => {
                try {
                    await ndk.connect();
                    const author = await ndk.getUser({ pubkey: message.pubkey });
                    if (author && author?.content) {
                        const authorFields = findKind0Fields(JSON.parse(author.content));
                        console.log("authorFields", authorFields);
                        if (authorFields) {
                            setAuthor(authorFields);
                        }
                    } else if (author?._pubkey) {
                        setAuthor(author?._pubkey);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            getAuthor();
        } else if (platform === "stackernews") {
            setMessageWithAuthor({
                content: message?.title,
                author: message?.user?.name,
                timestamp: message?.created_at ? Date.parse(message.created_at) : null,
                avatar: "https://pbs.twimg.com/profile_images/1403162883941359619/oca7LMQ2_400x400.png",
                channel: "~devs",
                ...message
            })
        }
        else {
            setLoading(false);
        }
    }, [ndk, message, platform]);

    useEffect(() => {
        if (author && formattedMessage && platform === 'nostr') {
            const body = {
                ...formattedMessage,
                timestamp: formattedMessage.created_at || message.created_at || message.timestamp,
                channel: "plebdevs",
                author: author
            };
            setMessageWithAuthor(body);
            setLoading(false);
        }
    }, [author, formattedMessage, message, platform]);

    return (
        <div className="w-full border-t-2 border-gray-700 py-4">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <CommunityMessage message={messageWithAuthor ? messageWithAuthor : message} platform={platform} />
            )}
        </div>
    );
};

export default MessageDropdownItem;