import React, { useRef, useState } from 'react';
import Image from 'next/image';
import UserAvatar from './user/UserAvatar';
import MenuTab from '../menutab/MenuTab';
import { Menubar } from 'primereact/menubar';
import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Navbar = () => {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const menu = useRef(null);

    const navbarHeight = '60px';

    const menuItems = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => {
                // Add your edit functionality here
            }
        },
        {
            label: 'Content',
            icon: 'pi pi-video',
            command: () => {
                // Add your delete functionality here
            }
        },
        {
            label: 'Chat',
            icon: 'pi pi-comment',
            items: [
                {
                    label: 'General',
                    icon: 'pi pi-hashtag',
                    command: () => {
                        // Add your edit functionality here
                    }
                },
                {
                    label: 'Nostr',
                    icon: 'pi pi-hashtag',
                    command: () => {
                        // Add your delete functionality here
                    }
                },
                {
                    label: 'Discord',
                    icon: 'pi pi-hashtag',
                    command: () => {
                        // Add your delete functionality here
                    }
                },
                {
                    label: 'Stackernews',
                    icon: 'pi pi-hashtag',
                    command: () => {
                        // Add your delete functionality here
                    }
                }
            ]
        }
    ];

    const start = (
        <div className='flex items-center'>
            {/* <div className='hidden max-tab:block max-mob:block max-tab:px-6 max-mob:px-6'>
                <i className="pi pi-bars text-xl pt-1"
                    onClick={(e) => menu.current.toggle(e)}></i>
                <Menu model={menuItems} popup ref={menu} />
            </div> */}
            <div onClick={() => router.push('/')} className="flex flex-row items-center justify-center cursor-pointer">
                <Image
                    alt="logo"
                    src="/plebdevs-guy.jpg"
                    width={50}
                    height={50}
                    className="rounded-full mr-2 max-tab:hidden max-mob:hidden"
                />
                <h1 className="text-white text-xl font-semibold max-tab:text-2xl max-mob:text-2xl">PlebDevs</h1>
            </div>
        </div>
    );

    return (
        <>
            <div className='w-[100vw] h-fit'>
                <Menubar
                    start={start}
                    end={UserAvatar}
                    className='px-[2%] py-8 bg-gray-800 border-t-0 border-l-0 border-r-0 rounded-none fixed z-10 w-[100vw] max-tab:px-[5%] max-mob:px-[5%]'
                    style={{ height: navbarHeight }}
                />
            </div>
            {/* Placeholder div with the same height as the Navbar */}
            <div style={{ height: navbarHeight }}></div>
        </>
    );
};

export default Navbar;
