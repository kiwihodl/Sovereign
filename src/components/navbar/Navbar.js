import React from 'react';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from './navbar.module.css';

const Navbar = () => {

    const end = (
        <Button
            label={"Login"}
            icon="pi pi-user"
            className="text-[#f8f8ff]"
            rounded
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
