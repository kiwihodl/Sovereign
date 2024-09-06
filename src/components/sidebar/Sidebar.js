import React from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import 'primeicons/primeicons.css';
import styles from "./sidebar.module.css";

const Sidebar = () => {
    const router = useRouter();

    // Helper function to determine if the path matches the current route
    const isActive = (path) => {
        return router.asPath === path;
    };

    const { data: session } = useSession();

    return (
        <div className='max-sidebar:hidden w-[14vw] bg-gray-800 p-2 fixed h-[100%] flex flex-col'>
            <div className="flex-grow overflow-y-auto">
                <div onClick={() => router.push('/')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/') ? 'bg-gray-700' : ''}`}>
                    <i className="pi pi-home pl-5" /> <p className="pl-2 rounded-md font-bold text-lg">Home</p>
                </div>
                <Accordion activeIndex={0} className={styles['p-accordion']} style={{ marginBottom: '0px', paddingBottom: '0px' }}>
                    <AccordionTab
                        pt={{
                            headerAction: ({ context }) => ({
                                className: `hover:bg-gray-700 rounded-lg ${isActive('/content') || router.pathname === '/content' ? 'bg-gray-700' : ''} ${styles['p-accordion-header-link']}`
                            }),
                            content: styles['p-accordion-content'],
                            header: 'text-lg'
                        }}
                        header={'Content'}>
                        <div onClick={() => router.push('/content?tag=all')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=all') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-eye text-sm pr-1"></i> All</p>
                        </div>
                        <div onClick={() => router.push('/content?tag=courses')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=courses') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-desktop text-sm pr-1"></i> Courses</p>
                        </div>
                        <div onClick={() => router.push('/content?tag=workshops')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=workshops') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-video text-sm pr-1"></i> Workshops</p>
                        </div>
                        <div onClick={() => router.push('/content?tag=resources')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=resources') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-file text-sm pr-1"></i> Resources</p>
                        </div>
                    </AccordionTab>
                </Accordion>
                <div onClick={() => router.push('/create')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/create') ? 'bg-gray-700' : ''}`}>
                    <i className="pi pi-plus pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Create</p>
                </div>
                <div onClick={() => session ? router.push('/profile?tab=subscribe') : router.push('/auth/signin')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/profile?tab=subscribe') ? 'bg-gray-700' : ''}`}>
                    <i className="pi pi-star pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Subscribe</p>
                </div>
                <Accordion activeIndex={0} className={styles['p-accordion']}>
                    <AccordionTab
                        pt={{
                            headerAction: ({ context }) => ({
                                className: `hover:bg-gray-700 rounded-lg ${isActive('/feed') ? 'bg-gray-700' : ''} ${styles['p-accordion-header-link']}`
                            }),
                            content: styles['p-accordion-content'],
                            header: 'text-lg'
                        }}
                        header={"Community"}>
                        <div onClick={() => router.push('/feed?channel=global')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=global') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> global</p>
                        </div>
                        <div onClick={() => router.push('/feed?channel=nostr')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=nostr') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> nostr</p>
                        </div>
                        <div onClick={() => router.push('/feed?channel=discord')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=discord') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> discord</p>
                        </div>
                        <div onClick={() => router.push('/feed?channel=stackernews')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=stackernews') ? 'bg-gray-700' : ''}`}>
                            <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> stackernews</p>
                        </div>
                    </AccordionTab>
                </Accordion>
            </div>
            <div className='mt-auto'>
                <div onClick={() => router.push('/profile?tab=settings')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/profile?tab=settings') ? 'bg-gray-700' : ''}`}>
                    <i className="pi pi-cog pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Settings</p>
                </div>
                <div onClick={() => session ? signOut() : router.push('/auth/signin')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/auth/signin') ? 'bg-gray-700' : ''}`}>
                    <i className={`pi ${session ? 'pi-sign-out' : 'pi-sign-in'} pl-5 text-sm`} /> <p className="pl-2 rounded-md font-bold text-lg">{session ? 'Logout' : 'Login'}</p>
                </div>
                {/* todo: have to add this extra button to push the sidebar to the right space but it doesnt seem to cause any negative side effects? */}
                <div onClick={signOut} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg`}>
                    <i className="pi pi-sign-out pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Logout</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
