import React from 'react';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import 'primereact/resources/primereact.min.css';                  // core css
import 'primeicons/primeicons.css';                                // icons
import styles from './navbar.module.css';     

const end = (
    <Button
        label="Login"
        icon="pi pi-user"
        className="p-button-rounded text-white"
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

const Navbar = () => {
    return (
        <Menubar start={start} end={end} />
    );
};

export default Navbar;
