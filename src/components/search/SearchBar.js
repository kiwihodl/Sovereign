import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputIcon } from 'primereact/inputicon';
import { IconField } from 'primereact/iconfield';
import { Dropdown } from 'primereact/dropdown';
import styles from './searchbar.module.css';

const SearchBar = () => {
    const [selectedSearchOption, setSelectedSearchOption] = useState({ name: 'Content', code: 'content', icon: 'pi pi-video' });
    const searchOptions = [
        { name: 'Content', code: 'content', icon: 'pi pi-video' },
        { name: 'Community', code: 'community', icon: 'pi pi-users' },
    ];

    const selectedOptionTemplate = (option, props) => {
        if (!props?.placeholder) {
            return (
                <div className="flex items-center">
                    <i className={option.icon + ' mr-2'}></i>
                    <span>{option.code}</span>
                </div>
            );
        }
        return <i className={option.icon + ' text-transparent text-xs'} />
    };

    return (
        <div className='absolute left-[50%] transform -translate-x-[50%]'>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"> </InputIcon>
                <InputText className='w-[300px]' v-model="value1" placeholder={`Search ${selectedSearchOption.name.toLowerCase()}`} pt={{
                    root: {
                        className: 'border-none rounded-tr-none rounded-br-none focus:border-none focus:ring-0 pr-0'
                    }
                }} />

                <Dropdown 
                    pt={{
                        root: {
                            className: 'border-none rounded-tl-none rounded-bl-none bg-gray-900/55 hover:bg-gray-900/30'
                        },
                        input: {
                            className: 'mx-0 px-0 shadow-lg'
                        }
                    }}
                    className={styles.dropdown}
                    value={selectedSearchOption} 
                    onChange={(e) => setSelectedSearchOption(e.value)} 
                    options={searchOptions} 
                    optionLabel="name" 
                    placeholder="Search"
                    dropdownIcon={
                        <div className='w-full pr-2 flex flex-row items-center justify-between'>
                            <i className={selectedSearchOption.icon + " text-white"} />
                            <i className="pi pi-chevron-down" />
                        </div>
                    }
                    valueTemplate={selectedOptionTemplate}
                    itemTemplate={selectedOptionTemplate}
                    required
                />
            </IconField>
        </div>
    );
};

export default SearchBar;
