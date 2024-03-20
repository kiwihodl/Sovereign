import React from 'react'; 
import { TabMenu } from 'primereact/tabmenu';

export default function MenuTab({items, activeIndex, onTabChange}) {
    return (
        <div className="w-[100%]">
            <TabMenu 
                className='w-full bg-transparent border-none'
                model={items}
                activeIndex={activeIndex}
                onTabChange={(e) => onTabChange(e.index)}
                pt={{
                    tabmenu: {
                        menu: ({ context }) => ({
                            className: 'bg-transparent border-none',
                        }),
                        action: ({ context }) => ({
                            className: 'bg-transparent border-none'
                        })
                    }
                }}
            />
        </div>
    );
}
