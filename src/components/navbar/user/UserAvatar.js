import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import useWindowWidth from '@/hooks/useWindowWidth';
import { useSession, signOut } from 'next-auth/react';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from '../navbar.module.css';

const UserAvatar = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState(null);
    const [visible, setVisible] = useState(false);
    const { returnImageProxy } = useImageProxy();
    const windowWidth = useWindowWidth();

    const { data: session, status } = useSession();

    useEffect(() => {
        if (session) {
            console.log(session);
            setUser(session.user);
        }
    }, [session]);

    const menu = useRef(null);

    const handleLogout = async () => {
        await signOut({ redirect: false }); // Wait for the sign-out to complete
        router.push('/').then(() => window.location.reload());
    }

    let userAvatar;

    useEffect(() => {
        setIsClient(true); // Component did mount, we're client-side
    }, []);

    // If not client, render nothing or a placeholder
    if (!isClient) {
        return null; // Or return a loader/spinner/placeholder
    } else if (user && Object.keys(user).length > 0) {
        // User exists, show username or pubkey
        const displayName = user.username || user?.email || user?.pubkey.slice(0, 10) + '...';

        const items = [
            {
                label: displayName,
                items: [
                    {
                        label: 'Profile',
                        icon: 'pi pi-user',
                        command: () => router.push('/profile?tab=profile')
                    },
                    {
                        label: 'Create',
                        icon: 'pi pi-book',
                        command: () => router.push('/create')
                    },
                    {
                        label: 'Logout',
                        icon: 'pi pi-power-off',
                        command: handleLogout
                    }
                ]
            }
        ];
        userAvatar = (
            <>
                <div onClick={(event) => menu.current.toggle(event)} className='flex flex-row items-center justify-between cursor-pointer hover:opacity-75'>
                    <Image
                        alt="logo"
                        src={returnImageProxy(user.avatar, user.pubkey)}
                        width={50}
                        height={50}
                        className={styles.logo}
                    />
                </div>
                <Menu model={items} popup ref={menu} className='w-[250px] break-words' />
            </>
        );
    } else {
        userAvatar = (
            <div className='flex flex-row items-center justify-between'>
                <Button severity='help' rounded label="About" className='text-[#f8f8ff] mr-4' onClick={() => setVisible(true)} size={windowWidth < 768 ? 'small' : 'normal'} />
                <Dialog header="About" visible={visible} onHide={() => { if (!visible) return; setVisible(false); }} className='w-[50vw] max-tab:w-[95vw]'>
                    <div className="space-y-6">
                        <p className="text-lg"><i className="pi pi-info-circle mr-2"></i>PlebDevs is a custom-built education platform designed to help aspiring developers, with a special focus on Bitcoin Lightning and Nostr technologies.</p>
                        
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold"><i className="pi pi-star mr-2"></i>Key Features:</h3>
                            <ul className="space-y-4">
                                <li><i className="pi pi-cloud mr-2"></i><span className="font-semibold">Content Distribution:</span> All educational content is published to Nostr and actively pulled from Nostr relays, ensuring decentralized and up-to-date information.</li>
                                
                                <li>
                                    <i className="pi pi-file-edit mr-2"></i><span className="font-semibold">Content Types:</span>
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                        <li><span className="italic">Resources:</span> Markdown documents posted as NIP-23 long-form events on Nostr.</li>
                                        <li><span className="italic">Workshops:</span> Enhanced markdown files with rich media support, including embedded videos, also saved as NIP-23 events.</li>
                                        <li><span className="italic">Courses:</span> Nostr lists that combine multiple resources and workshops into a structured learning path.</li>
                                    </ul>
                                </li>
                                
                                <li>
                                    <i className="pi pi-dollar mr-2"></i><span className="font-semibold">Monetization:</span>
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                        <li>All content is zappable, allowing for micropayments.</li>
                                        <li>Some content is &apos;paid&apos;, requiring either atomic payments or a subscription for access.</li>
                                        <li>Subscription options include pay-as-you-go and recurring payments via Nostr Wallet Connect.</li>
                                    </ul>
                                </li>
                                
                                <li><i className="pi pi-users mr-2"></i><span className="font-semibold">Community Engagement:</span> A dedicated community section pulls in relevant PlebDevs channels. Users can read all PlebDevs content and interact with the community via Nostr.</li>
                                
                                <li>
                                    <i className="pi pi-check-circle mr-2"></i><span className="font-semibold">Subscription Benefits:</span>
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                        <li>Access to all content, including paid resources.</li>
                                        <li>Exclusive 1:1 calendar for personalized support.</li>
                                        <li>Access to exclusive channels.</li>
                                        <li>Personal mentorship to ensure success in becoming a developer.</li>
                                    </ul>
                                </li>
                                
                                <li><i className="pi pi-cog mr-2"></i><span className="font-semibold">Technology Stack:</span> The platform leverages Nostr for content distribution and community interaction, and Bitcoin Lightning Network for micropayments and subscriptions.</li>
                                
                                <li><i className="pi pi-user mr-2"></i><span className="font-semibold">User Experience:</span> Seamless integration of learning resources, community engagement, and payment systems, with a focus on practical skills development in Bitcoin, Lightning, and Nostr technologies.</li>
                            </ul>
                        </div>
                        
                        <p className="italic text-lg"><i className="pi pi-flag mr-2"></i>PlebDevs aims to provide a comprehensive, decentralized learning experience for aspiring developers, with a strong emphasis on emerging technologies in the Bitcoin ecosystem.</p>
                    </div>
                </Dialog>
                <Button
                    label="Login"
                    icon="pi pi-user"
                    className="text-[#f8f8ff]"
                    rounded
                    onClick={() => router.push('/auth/signin')}
                    size={windowWidth < 768 ? 'small' : 'normal'}
                />
            </div>
        );
    }

    return userAvatar;
};

export default UserAvatar;
