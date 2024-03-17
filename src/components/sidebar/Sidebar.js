import React from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useRouter } from 'next/router';
import 'primeicons/primeicons.css';

const Sidebar = () => {
    const router = useRouter();

    // Helper function to determine if the path matches the current route
    const isActive = (path) => {
        return router.pathname === path;
    };

    return (
        <div className='max-mob:hidden max-tab:hidden w-[15vw] bg-gray-800 p-4 h-screen'>
            <div onClick={() => router.push('/')} className={`w-full cursor-pointer hover:bg-gray-700 rounded-lg ${isActive('/') ? 'bg-gray-700' : ''}`}>
                <p className="p-2 my-2 pl-5 rounded-md font-bold"><i className="pi pi-home" /> Home</p>
            </div>
            <div onClick={() => router.push('/content')} className={`w-full cursor-pointer hover:bg-gray-700 rounded-lg ${isActive('/content') ? 'bg-gray-700' : ''}`}>
                <p className="p-2 my-2 pl-5 rounded-md font-bold"><i className="pi pi-video" /> Content</p>
            </div>

            <Accordion
                activeIndex={0}
                pt={{
                    tab: {
                        header: ({ context }) => ({
                            className: 'border-none bg-transparent hover:bg-gray-700 rounded-lg',
                        }),
                        headerAction: ({ context }) => ({
                            className: 'border-none bg-transparent py-3 my-2',
                        }),
                        content: { className: 'border-none bg-transparent pt-0' }
                    }
                }}
                className="unstyled border-none bg-transparent">
                <AccordionTab header={"Chat"}>
                    <div onClick={() => router.push('/chat/general')} className={`w-full cursor-pointer hover:bg-gray-700 rounded-lg ${isActive('/chat/general') ? 'bg-gray-700' : ''}`}>
                        <p className="p-2 my-2 rounded-md font-bold"><i className="pi pi-hashtag"></i> general</p>
                    </div>
                    <div onClick={() => router.push('/chat/nostr')} className={`w-full cursor-pointer hover:bg-gray-700 rounded-lg ${isActive('/chat/nostr') ? 'bg-gray-700' : ''}`}>
                        <p className="p-2 my-2 rounded-md font-bold"><i className="pi pi-hashtag"></i> nostr</p>
                    </div>
                    <div onClick={() => router.push('/chat/discord')} className={`w-full cursor-pointer hover:bg-gray-700 rounded-lg ${isActive('/chat/discord') ? 'bg-gray-700' : ''}`}>
                        <p className="p-2 my-2 rounded-md font-bold"><i className="pi pi-hashtag"></i> discord</p>
                    </div>
                    <div onClick={() => router.push('/chat/stackernews')} className={`w-full cursor-pointer hover:bg-gray-700 rounded-lg ${isActive('/chat/stackernews') ? 'bg-gray-700' : ''}`}>
                        <p className="p-2 my-2 rounded-md font-bold"><i className="pi pi-hashtag"></i> stackernews</p>
                    </div>
                </AccordionTab>
            </Accordion>
        </div>
    );
};

export default Sidebar;
