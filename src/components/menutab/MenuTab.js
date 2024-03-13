import React from 'react'; 
import { TabMenu } from 'primereact/tabmenu';

export default function MenuTab({items}) {
    return (
        <div className="w-full">
            <TabMenu 
                className='w-full bg-transparent border-none'
                model={items}
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
    )
}
