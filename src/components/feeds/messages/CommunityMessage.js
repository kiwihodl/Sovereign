import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';
import GenericButton from '@/components/buttons/GenericButton';
import { highlightText } from '@/utils/text';
import { useSession } from 'next-auth/react';
import NostrIcon from '../../../../public/images/nostr.png';
import Image from 'next/image';
import { nip19 } from 'nostr-tools';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import useWindowWidth from '@/hooks/useWindowWidth';

const StackerNewsIconComponent = () => (
    <svg width="16" height="16" className='mr-2' viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#facc15" fillRule="evenodd" d="m41.7 91.4 41.644 59.22-78.966 69.228L129.25 155.94l-44.083-58.14 54.353-65.441Z" />
        <path fill="#facc15" fillRule="evenodd" d="m208.355 136.74-54.358-64.36-38.4 128.449 48.675-74.094 64.36 65.175L251.54 42.497Z" />
    </svg>
);

const headerTemplate = (options, windowWidth, platform, id) => {
    return (
        <div className="flex flex-row justify-between items-end mb-2">
            <GenericButton outlined severity="primary" size="small" className="py-0" onClick={options.onTogglerClick} icon={options.collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'} tooltip={windowWidth <= 768 ? null : 'comments'} tooltipOptions={{ position: 'right' }} />
            <GenericButton
                label={windowWidth > 768 ? `View ${platform === 'nostr' ? 'on' : 'in'} ${platform}` : null}
                icon="pi pi-external-link"
                outlined
                size="small"
                onClick={() => window.open(getPlatformLink(platform, id), '_blank')}
                tooltip={windowWidth < 768 ? `View ${platform === 'nostr' ? 'on' : 'in'} ${platform}` : null}
                tooltipOptions={{ position: 'left' }}
            />
        </div>
    );
};

const CommunityMessage = ({ message, searchQuery, windowWidth, platform }) => {
    const [npub, setNpub] = useState(null);
    const [collapsed, setCollapsed] = useState(true);
    const { data: session } = useSession();
    const isMobileView = windowWidth <= 768;

    useEffect(() => {
        if (session?.user?.pubkey) {
            setNpub(nip19.npubEncode(session.user.pubkey));
        }
    }, [session]);

    const header = (
        <div className="flex flex-row w-full items-center justify-between p-4 bg-gray-800 rounded-t-lg">
            <div className="flex flex-row items-center">
                <Avatar image={message.avatar ? message.avatar : null} icon={message.avatar ? null : "pi pi-user"} shape="circle" size="large" className="border-2 border-blue-400" />
                <p className="pl-4 font-bold text-xl text-white">{message?.pubkey ? (message?.pubkey.slice(0, 12) + "...") : message.author}</p>
            </div>
            <div className="flex flex-col items-start justify-between">
                <div className="flex flex-row w-full justify-between items-center my-1 max-sidebar:flex-col max-sidebar:items-start">
                    <Tag value={message.channel} severity="primary" className="w-fit text-[#f8f8ff] bg-gray-600 mr-2 max-sidebar:mr-0" />
                    <Tag icon={getPlatformIcon(platform)} value={platform} className="w-fit text-[#f8f8ff] bg-blue-400 max-sidebar:mt-1" />
                </div>
            </div>
        </div>
    );

    const footer = (
        <div className='w-full flex flex-col justify-between items-start'>
            {
                platform === 'nostr' ? (
                    <p className="rounded-lg text-sm text-gray-300">
                        {new Date(message.timestamp).toLocaleString()}
                    </p>
                ) : null
            }
            <div className="w-full flex flex-row justify-between items-end">
                {
                    platform === 'nostr' ? (
                        <Panel
                            headerTemplate={() => headerTemplate({ onTogglerClick: () => setCollapsed(!collapsed) }, windowWidth, platform, message.id)}
                            toggleable
                            collapsed={collapsed}
                            onToggle={(e) => setCollapsed(e.value)}
                            className="w-full"
                        >
                            <div className="max-w-[100vw]">
                                <ZapThreadsWrapper
                                    anchor={nip19.noteEncode(message.id)}
                                    user={npub || null}
                                    relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://relay.mutinywallet.com/, wss://relay.primal.net/"
                                    disable="zaps"
                                />
                            </div>
                        </Panel>
                    ) : (
                        <div className="w-full flex flex-row justify-between items-end">
                            {platform !== "nostr" ? (
                                <p className="rounded-lg text-sm text-gray-300">
                                    {new Date(message.timestamp).toLocaleString()}
                                </p>
                            ) : <div></div>}
                            <GenericButton
                                label={windowWidth > 768 ? `View in ${platform}` : null}
                                icon="pi pi-external-link"
                                outlined
                                size="small"
                                onClick={() => window.open(getPlatformLink(platform, message.id), '_blank')}
                                tooltip={windowWidth < 768 ? `View in ${platform}` : null}
                                tooltipOptions={{ position: 'left' }}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    );

    return (
        <Card
            header={header}
            footer={footer}
            className="w-full bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
            pt={{
                footer: {
                    className: 'mt-0 pt-0'
                },
                content: {
                    className: 'mt-0 pt-0'
                }
            }}
        >
            <p className="m-0 text-lg text-gray-200 break-words">{highlightText(message.content, searchQuery)}</p>
        </Card>
    );
};

const getPlatformLink = (platform, id) => {
    switch (platform) {
        case 'discord':
            return "https://discord.gg/t8DCMcq39d";
        case 'stackernews':
            return `https://stacker.news/items/${id}`;
        case 'nostr':
            return `https://nostr.band/${nip19.noteEncode(id)}`;
        default:
            return "#";
    }
};

const getPlatformIcon = (platform) => {
    switch (platform) {
        case 'stackernews':
            return <StackerNewsIconComponent />;
        case 'nostr':
            return <Image src={NostrIcon} alt="Nostr" width={16} height={16} className='mr-1' />;
        default:
            return `pi pi-${platform}`;
    }
};

export default CommunityMessage;
