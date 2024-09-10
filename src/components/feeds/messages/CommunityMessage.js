import React from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import GenericButton from '@/components/buttons/GenericButton';
import { highlightText } from '@/utils/text';
import NostrIcon from '../../../../public/images/nostr.png';
import Image from 'next/image';
import { nip19 } from 'nostr-tools';

const StackerNewsIconComponent = () => (
	<svg width="16" height="16" className='mr-2' viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill="#facc15" fillRule="evenodd" d="m41.7 91.4 41.644 59.22-78.966 69.228L129.25 155.94l-44.083-58.14 54.353-65.441Z"/>
		<path fill="#facc15" fillRule="evenodd" d="m208.355 136.74-54.358-64.36-38.4 128.449 48.675-74.094 64.36 65.175L251.54 42.497Z"/>
	</svg>
);

const CommunityMessage = ({ message, searchQuery, windowWidth, platform }) => {
    const header = (
        <div className="flex flex-row w-full items-center justify-between p-4 bg-gray-800 rounded-t-lg">
            <div className="flex flex-row items-center">
                <Avatar image={message.avatar} shape="circle" size="large" className="border-2 border-blue-400" />
                <p className="pl-4 font-bold text-xl text-white">{message.author}</p>
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
        <div className="w-full flex justify-between items-center">
            <span className="rounded-lg text-sm text-gray-300">
                {new Date(message.timestamp).toLocaleString()}
            </span>
            <GenericButton
                label={windowWidth > 768 ? `View in ${platform}` : null}
                icon="pi pi-external-link"
                outlined
                size="small"
                className='my-2'
                onClick={() => window.open(getPlatformLink(platform, message.id), '_blank')}
                tooltip={windowWidth < 768 ? `View in ${platform}` : null}
                tooltipOptions={{ position: 'left' }}
            />
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