import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { useSelector } from 'react-redux';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from './navbar.module.css';

const Navbar = () => {
    const router = useRouter();
    const user = useSelector((state) => state.user);

    const end = (
        (user && user?.username || user.pubkey) ?
        <h1>{user.username || user.pubkey}</h1>
         :
        <Button
            label={"Login"}
            icon="pi pi-user"
            className="text-[#f8f8ff]"
            rounded
            onClick={() => router.push('/login')}
        />
    );

    const start = (
        <div className={styles.titleContainer}>
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
        <Menubar start={start} end={end} className='px-[5%]' />
    );
};

export default Navbar;
