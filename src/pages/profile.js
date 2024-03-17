import React, {useRef} from "react";
import { Button } from "primereact/button";
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import { Column } from 'primereact/column';
import { useSelector } from "react-redux";
import { useImageProxy } from "@/hooks/useImageProxy";
import Image from "next/image";

const Profile = () => {
    const user = useSelector((state) => state.user.user);
    const { returnImageProxy } = useImageProxy();
    const menu = useRef(null);

    const purchases = [
        {
            cost: 100,
            name: 'Course 1',
            category: 'Education',
            date: '2021-09-01'
        },
        {
            cost: 200,
            name: 'Course 2',
            category: 'Education',
            date: '2021-09-01'
        },
        {
            cost: 300,
            name: 'Course 3',
            category: 'Education',
            date: '2021-09-01'
        },
        {
            cost: 400,
            name: 'Course 4',
            category: 'Education',
            date: '2021-09-01'
        }
    ];

    const menuItems = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                // Add your edit functionality here
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
                // Add your delete functionality here
            }
        }
    ];


    return (
        <>
            <div className="w-[85vw] flex flex-col justify-center mx-auto">
                <div className="relative flex w-full items-center justify-center">
                    {user.avatar && (
                        <Image
                            alt="user's avatar"
                            src={returnImageProxy(user.avatar)}
                            width={100}
                            height={100}
                            className="rounded-full my-4"
                        />
                    )}
                    <i className="pi pi-ellipsis-h absolute right-24 text-2xl my-4 cursor-pointer hover:opacity-75"
                       onClick={(e) => menu.current.toggle(e)}></i>
                    <Menu model={menuItems} popup ref={menu} />
                </div>


                <h1 className="text-center text-2xl my-2">{user.username}</h1>
                <h2 className="text-center text-xl my-2">{user.pubkey}</h2>
                <div className="flex flex-col w-1/2 mx-auto my-4 justify-between items-center">
                    <h2>Subscription</h2>
                    <p>You currently have no active subscription</p>
                    <Button label="Subscribe" className="p-button-raised p-button-success w-auto my-2 text-[#f8f8ff]" />
                </div>
            </div>
            <DataTable emptyMessage="No purchases" value={purchases} tableStyle={{ minWidth: '10rem' }}>
                <Column field="cost" header="Cost"></Column>
                <Column field="name" header="Name"></Column>
                <Column field="category" header="Category"></Column>
                <Column field="date" header="Date"></Column>
            </DataTable>
        </>
    )
}

export default Profile