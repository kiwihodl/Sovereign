import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CommunityMessage from '@/components/feeds/messages/CommunityMessage';
import { parseMessageEvent } from '@/utils/nostr';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNDKContext } from '@/context/NDKContext';
import useWindowWidth from '@/hooks/useWindowWidth';
import Image from 'next/image';
import { formatTimestampToHowLongAgo } from '@/utils/time';
import NostrIcon from '/public/images/nostr.png';
import { useImageProxy } from '@/hooks/useImageProxy';
import { highlightText, getTextWithMatchContext } from '@/utils/text';

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
  
  // Get match information
  const matches = useMemo(() => message?._matches || {}, [message]);

  // Determine the platform once when component mounts or message changes
  const determinePlatform = useCallback(() => {
    if (messageRef?.channel) return 'discord';
    if (messageRef?.kind) return 'nostr';
    return 'stackernews';
  }, [messageRef]);

  // Memoize the fetchNostrAuthor function
  const fetchNostrAuthor = useCallback(
    async pubkey => {
      if (!ndk || !pubkey) return null;

      try {
        await ndk.connect();
        const user = await ndk.getUser({ pubkey });
        const profile = await user.fetchProfile();

        // Return the parsed profile data directly - it already contains what we need
        return profile;
      } catch (error) {
        console.error('Error fetching Nostr author:', error);
        return null;
      }
    },
    [ndk]
  );

  // Process message based on platform type
  useEffect(() => {
    // Prevent execution if no message data or already loaded
    if (!messageRef || messageData) return;

    const currentPlatform = determinePlatform();
    setPlatform(currentPlatform);

    let isMounted = true;

    const processMessage = async () => {
      try {
        if (currentPlatform === 'nostr') {
          // Format Nostr message
          const parsedMessage = parseMessageEvent(messageRef);

          // Fetch author data for Nostr messages
          let authorData = null;
          if (messageRef?.pubkey) {
            authorData = await fetchNostrAuthor(messageRef.pubkey);
          }

          // Extract author details with fallbacks
          const authorName = authorData?.name || authorData?.displayName || 'Unknown User';
          const authorPicture = authorData?.picture || authorData?.image || null;

          // Only update state if component is still mounted
          if (isMounted) {
            setMessageData({
              ...parsedMessage,
              timestamp: messageRef.created_at || Math.floor(Date.now() / 1000),
              channel: 'plebdevs',
              author: authorName,
              avatar: authorPicture,
              avatarProxy: authorPicture ? returnImageProxy(authorPicture) : null,
              type: 'nostr',
              id: messageRef.id,
              _matches: messageRef._matches
            });
          }
        } else if (currentPlatform === 'discord') {
          const avatarUrl = messageRef?.author?.avatar
            ? `https://cdn.discordapp.com/avatars/${messageRef.author.id}/${messageRef.author.avatar}.png`
            : null;

          if (isMounted) {
            setMessageData({
              content: messageRef?.content,
              author: messageRef?.author?.username || 'Unknown User',
              timestamp: messageRef?.timestamp
                ? Math.floor(messageRef.timestamp / 1000)
                : Math.floor(Date.now() / 1000),
              avatar: avatarUrl,
              avatarProxy: avatarUrl ? returnImageProxy(avatarUrl) : null,
              channel: messageRef?.channel || 'discord',
              type: 'discord',
              id: messageRef.id,
              _matches: messageRef._matches
            });
          }
        } else if (currentPlatform === 'stackernews') {
          if (isMounted) {
            setMessageData({
              content: messageRef?.title,
              author: messageRef?.user?.name || 'Unknown User',
              timestamp: messageRef?.created_at
                ? Math.floor(Date.parse(messageRef.created_at) / 1000)
                : Math.floor(Date.now() / 1000),
              avatar:
                'https://pbs.twimg.com/profile_images/1403162883941359619/oca7LMQ2_400x400.png',
              avatarProxy: returnImageProxy(
                'https://pbs.twimg.com/profile_images/1403162883941359619/oca7LMQ2_400x400.png'
              ),
              channel: '~devs',
              type: 'stackernews',
              id: messageRef.id,
              _matches: messageRef._matches
            });
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
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

    const authorName = messageData.author || 'Unknown User';
    const avatarUrl = messageData.avatarProxy || returnImageProxy(messageData.avatar);
    const messageDate = messageData.timestamp
      ? formatTimestampToHowLongAgo(messageData.timestamp)
      : '';
    
    // Get the content with highlighting if there's a match
    const contentMatches = messageData._matches?.content || messageData._matches?.title;
    const displayContent = contentMatches
      ? highlightText(
          getTextWithMatchContext(messageData.content, contentMatches.term, 60),
          contentMatches.term,
          'bg-yellow-500/30 text-white font-medium px-0.5 rounded'
        )
      : messageData.content;

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
              <div className="font-medium text-[#f8f8ff]">{authorName}</div>
              <div className="text-xs text-gray-400">{messageDate}</div>
            </div>
            <p className="text-neutral-50/90 whitespace-pre-wrap mb-3 line-clamp-3">
              {displayContent}
            </p>

            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center">
                {getPlatformIcon()}
                {platform}
              </div>
              <div className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm">plebdevs</div>
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
      avatar: messageData?.avatarProxy || returnImageProxy(messageData?.avatar),
    };
  }, [messageData, returnImageProxy]);

  return (
    <div
      className="group px-6 py-5 border-b border-gray-700/50 cursor-pointer hover:bg-gray-800/30 transition-colors duration-200"
      onClick={() => !loading && onSelect(messageData || messageRef)}
    >
      {loading ? (
        <div className="w-full h-[100px] flex items-center justify-center">
          <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
        </div>
      ) : isMobile ? (
        renderSimplifiedMessage()
      ) : (
        <div className="flex flex-col">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700/50 flex-shrink-0 shadow-lg">
              {messageData?.avatarProxy ? (
                <Image
                  src={messageData.avatarProxy}
                  alt="avatar"
                  width={48}
                  height={48}
                  className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-[1.05]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="pi pi-user text-gray-400 text-xl" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-[#f8f8ff] group-hover:text-white transition-colors duration-200">
                  {messageData?.author}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  {messageData?.timestamp ? formatTimestampToHowLongAgo(messageData.timestamp) : ''}
                </div>
              </div>
              
              <p className="text-neutral-50/80 whitespace-pre-wrap mb-3 text-sm leading-relaxed group-hover:text-neutral-50/90 transition-colors duration-200">
                {messageData?._matches?.content || messageData?._matches?.title
                  ? highlightText(
                      getTextWithMatchContext(
                        messageData?.content,
                        (messageData?._matches?.content || messageData?._matches?.title).term,
                        80
                      ),
                      (messageData?._matches?.content || messageData?._matches?.title).term,
                      'bg-yellow-500/30 text-white font-medium px-0.5 rounded'
                    )
                  : messageData?.content}
              </p>

              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium flex items-center group-hover:bg-blue-500/30 transition-colors duration-200">
                  {getPlatformIcon()}
                  {platform}
                </div>
                <div className="px-3 py-1.5 bg-gray-700/50 border border-gray-600/30 text-gray-300 rounded-full text-xs font-medium group-hover:bg-gray-700/70 transition-colors duration-200">
                  plebdevs
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDropdownItem;
