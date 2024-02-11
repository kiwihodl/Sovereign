import React, {useRef} from 'react';
import Image from 'next/image';
import UserAvatar from './user/UserAvatar';
import { Menubar } from 'primereact/menubar';
import { useRouter } from 'next/router';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from './navbar.module.css';

const Navbar = () => {
    const router = useRouter();

    const start = (
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
    );

    return (
        <Menubar start={start} end={UserAvatar} className='px-[5%]' />
    );
};

export default Navbar;
