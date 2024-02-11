import React from "react";
import { Button } from "primereact/button";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useSelector } from "react-redux";
import { useImageProxy } from "@/hooks/useImageProxy";
import Image from "next/image";

const Profile = () => {
    const user = useSelector((state) => state.user.user);
    const { returnImageProxy } = useImageProxy();

    const purchases = [
        { code: '123', name: 'Product 1', category: 'Category 1', quantity: 1 },
        { code: '124', name: 'Product 2', category: 'Category 2', quantity: 2 },
        { code: '125', name: 'Product 3', category: 'Category 3', quantity: 3 },
        { code: '126', name: 'Product 4', category: 'Category 4', quantity: 4 },
        { code: '127', name: 'Product 5', category: 'Category 5', quantity: 5 },
    ];

    return (
        <>
            <div className="flex flex-col justify-center">
                {user.avatar && (
                    <Image
                        alt="logo"
                        src={returnImageProxy(user.avatar)}
                        width={100}
                        height={100}
                        className="rounded-full mx-auto my-4"
                    />
                )}
                <h1 className="text-center text-2xl my-2">{user.username}</h1>
                <h2 className="text-center text-xl my-2">{user.pubkey}</h2>
                <div className="flex flex-row w-1/2 mx-auto my-4 justify-between">
                    <Button label="Edit" className="p-button-raised text-[#f8f8ff]" />
                    <Button label="Delete" className="p-button-raised p-button-danger text-[#f8f8ff]" />
                </div>
                <div className="flex flex-col w-1/2 mx-auto my-4 justify-between items-center">
                    <h2>Subscription</h2>
                    <p>You currently have no active subscription</p>
                    <Button label="Subscribe" className="p-button-raised p-button-success w-auto my-2 text-[#f8f8ff]" />
                </div>
            </div>
            <DataTable value={purchases} tableStyle={{ minWidth: '50rem' }}>
                <Column field="code" header="Code"></Column>
                <Column field="name" header="Name"></Column>
                <Column field="category" header="Category"></Column>
                <Column field="quantity" header="Quantity"></Column>
            </DataTable>
        </>
    )
}

export default Profile