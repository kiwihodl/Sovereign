import React, { useState, useEffect } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import GenericButton from '@/components/buttons/GenericButton';
import Image from 'next/image';
import StackerNewsIcon from '../../../public/images/sn.svg';
import NostrIcon from '../../../public/images/nostr.png';

const CommunityMenuTab = ({ selectedTopic, onTabChange }) => {
    const allItems = ['global', 'nostr', 'discord', 'stackernews'];

    useEffect(() => {
        console.log(selectedTopic);
    }, [selectedTopic]);

    const menuItems = allItems.map((item, index) => {
        let icon;
        switch (item) {
            case 'global':
                icon = 'pi pi-globe';
                break;
            case 'nostr':
                icon = (<div className='mr-4 flex items-center'>
                    <Image src={NostrIcon} alt="Nostr" width={18} height={18} className='absolute left-3' />
                </div>);
                break;
            case 'discord':
                icon = 'pi pi-discord';
                break;
            case 'stackernews':
                icon = (<div className='mr-5 flex items-center'>
                    <Image src={StackerNewsIcon} alt="StackerNews" width={20} height={20} className='absolute left-3' />
                </div>);
                break;
        }

        return {
            label: (
                <GenericButton
                    className={`${selectedTopic === item ? 'bg-primary text-white' : ''}`}
                    onClick={() => onTabChange(item)}
                    outlined={selectedTopic !== item}
                    rounded
                    size="small"
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

export default CommunityMenuTab;
