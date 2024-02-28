import React, { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '@/redux/reducers/userReducer';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from '../navbar.module.css';

const UserAvatar = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const { returnImageProxy } = useImageProxy();

    const menu = useRef(null);

    const handleLogout = () => {
        window.localStorage.removeItem('pubkey');
        dispatch(setUser(null));
        router.push('/');
    }

    let userAvatar;

    if (user && Object.keys(user).length > 0) {
        // User exists, show username or pubkey
        const displayName = user.username || user.pubkey;

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
                    {user.avatar && (
                        <Image
                            alt="logo"
                            src={returnImageProxy(user.avatar)}
                            width={50}
                            height={50}
                            className={styles.logo}
                        />
                    )}
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
                onClick={() => router.push('/login')}
            />
        );
    }

    return userAvatar;
};

export default UserAvatar;
