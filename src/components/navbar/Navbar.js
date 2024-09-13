import React, { useRef, useState } from 'react';
import Image from 'next/image';
import UserAvatar from './user/UserAvatar';
import MenuTab from '../menutab/MenuTab';
import { Menubar } from 'primereact/menubar';
import { useRouter } from 'next/router';
import { InputText } from 'primereact/inputtext';
import { InputIcon } from 'primereact/inputicon';
import { IconField } from 'primereact/iconfield';
import { Dropdown } from 'primereact/dropdown';
import styles from './navbar.module.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Navbar = () => {
    const router = useRouter();
    const [selectedSearchOption, setSelectedSearchOption] = useState({ name: 'Content', code: 'content', icon: 'pi pi-video' });
    const searchOptions = [
        { name: 'Content', code: 'content', icon: 'pi pi-video' },
        { name: 'Community', code: 'community', icon: 'pi pi-users' },
    ];

    const navbarHeight = '60px';

    const selectedOptionTemplate = (option, props) => {
        console.log(option, props);
        if (!props?.placeholder) {
            return (
                <div className="flex items-center">
                    <i className={option.icon + ' mr-2'}></i>
                    <span>{option.code}</span>
                </div>
            );
        }
        return <span>{option.code}</span>
    };

    const start = (
        <div className='flex items-center'>
            <div onClick={() => router.push('/')} className="flex flex-row items-center justify-center cursor-pointer">
                <Image
                    alt="logo"
                    src="/images/plebdevs-guy.png"
                    width={50}
                    height={50}
                    className="rounded-full mr-2 max-tab:hidden max-mob:hidden"
                />
                <h1 className="text-white text-xl font-semibold max-tab:text-2xl max-mob:text-2xl">PlebDevs</h1>
            </div>
            <div className='absolute left-[50%] transform -translate-x-[50%]'>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText className='w-[300px]' v-model="value1" placeholder="Search" pt={{
                        root: {
                            className: 'border-none rounded-tr-none rounded-br-none focus:border-none focus:ring-0 pr-0'
                        }
                    }} />

                    <Dropdown 
                        pt={{
                            root: {
                                className: 'border-none rounded-tl-none rounded-bl-none'
                            },
                            input: {
                                className: 'mx-0 px-0'
                            }
                        }}
                        className={styles.dropdown}
                        value={selectedSearchOption} 
                        onChange={(e) => setSelectedSearchOption(e.value)} 
                        options={searchOptions} 
                        optionLabel="name" 
                        placeholder="Search"
                        dropdownIcon={selectedSearchOption.icon}
                        valueTemplate={selectedOptionTemplate}
                        itemTemplate={selectedOptionTemplate}
                        required
                    />
                </IconField>
            </div>
        </div>
    );

    return (
        <>
            <div className='w-[100vw] h-fit z-20'>
                <Menubar
                    start={start}
                    end={UserAvatar}
                    className='px-6 py-8 bg-gray-800 border-t-0 border-l-0 border-r-0 rounded-none fixed z-10 w-[100vw] max-tab:px-[5%] max-mob:px-[5%]'
                    style={{ height: navbarHeight }}
                />
            </div>
            {/* Placeholder div with the same height as the Navbar */}
            <div style={{ height: navbarHeight }}></div>
        </>
    );
};

export default Navbar;
