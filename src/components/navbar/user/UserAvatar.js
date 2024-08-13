import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import useWindowWidth from '@/hooks/useWindowWidth';
import {useSession, signOut} from 'next-auth/react';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from '../navbar.module.css';

const UserAvatar = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState(null);
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
        const displayName = user.username || user.pubkey.slice(0, 10) + '...';

        const items = [
            {
                label: displayName,
                items: [
                    {
                        label: 'Profile',
                        icon: 'pi pi-user',
                        command: () => router.push('/profile')
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
                <Menu model={items} popup ref={menu} />
            </>
        );
    } else {
        userAvatar = (
            <Button
                label="Login"
                icon="pi pi-user"
                className="text-[#f8f8ff]"
                rounded
                onClick={() => router.push('/auth/signin')}
                size={windowWidth < 768 ? 'small' : 'normal'}
            />
        );
    }

    return userAvatar;
};

export default UserAvatar;
