import React, { useRef } from 'react';
import Image from 'next/image';
import UserAvatar from './user/UserAvatar';
import MenuTab from '../menutab/MenuTab';
import { Menubar } from 'primereact/menubar';
import { useRouter } from 'next/router';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from './navbar.module.css';

const Navbar = () => {
    const router = useRouter();

    const start = (
        <div className='w-full flex flex-row justify-between'>
            <div onClick={() => router.push('/')} className={styles.titleContainer}>
                <Image
                    alt="logo"
                    src="/plebdevs-guy.jpg"
                    width={50}
                    height={50}
                    className={`${styles.logo}`}
                />
                <h1 className={styles.title}>PlebDevs</h1>
            </div>
        </div>
    );

    return (
        <Menubar start={start} end={UserAvatar} className='px-[2%] bg-gray-800 border-t-0 border-l-0 border-r-0 rounded-none' />
    );
};

export default Navbar;
