import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import { Column } from "primereact/column";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from "primereact/progressspinner";
import PurchasedListItem from "@/components/profile/PurchasedListItem";
import { useNDKContext } from "@/context/NDKContext";
import { formatDateTime } from "@/utils/time";
import UserContent from "@/components/profile/UserContent";
import Image from "next/image";
import BitcoinConnectButton from "@/components/bitcoinConnect/BitcoinConnect";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [bitcoinConnect, setBitcoinConnect] = useState(false);

    const { data: session, status } = useSession();
    const { returnImageProxy } = useImageProxy();
    const { ndk } = useNDKContext();
    const menu = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const bitcoinConnectConfig = window.localStorage.getItem('bc:config');

        if (bitcoinConnectConfig) {
            setBitcoinConnect(true);
        }
    }, []);

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    const menuItems = [
        {
            label: "Edit",
            icon: "pi pi-pencil",
            command: () => {
                // Add your edit functionality here
            },
        },
        {
            label: "Delete",
            icon: "pi pi-trash",
            command: () => {
                // Add your delete functionality here
            },
        },
    ];

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold text-white">Purchases</span>
        </div>
    );

    return (
        user && (
            <div className="w-[90vw] mx-auto max-tab:w-[100vw] max-mob:w-[100vw]">
                <div className="w-[85vw] flex flex-col justify-center mx-auto max-tab:w-[100vw] max-mob:w-[100vw]">
                    <div className="relative flex w-full items-center justify-center">
                        <Image
                            alt="user's avatar"
                            src={returnImageProxy(user.avatar, user.pubkey)}
                            width={100}
                            height={100}
                            className="rounded-full my-4"
                        />
                        <i
                            className="pi pi-ellipsis-h absolute right-24 text-2xl my-4 cursor-pointer hover:opacity-75"
                            onClick={(e) => menu.current.toggle(e)}
                        ></i>
                        <Menu model={menuItems} popup ref={menu} />
                    </div>

                    <h1 className="text-center text-2xl my-2">
                        {user.username || "Anon"}
                    </h1>
                    <h2 className="text-center text-xl my-2 truncate max-tab:px-4 max-mob:px-4">
                        {user.pubkey}
                    </h2>
                    <div className="flex flex-col w-1/2 mx-auto my-4 justify-between items-center">
                        <h2>Connect Your Lightning Wallet</h2>
                        {bitcoinConnect ? <BitcoinConnectButton /> : <p>Connecting...</p>}
                    </div>
                    <div className="flex flex-col w-1/2 mx-auto my-4 justify-between items-center">
                        <h2>Subscription</h2>
                        <p className="text-center">You currently have no active subscription</p>
                        <Button
                            label="Subscribe"
                            className="p-button-raised p-button-success w-auto my-2 text-[#f8f8ff]"
                        />
                    </div>
                </div>
                {!session || !session?.user || !ndk ? (
                    <ProgressSpinner />
                ) : (
                    <DataTable
                        emptyMessage="No purchases"
                        value={session.user?.purchased}
                        tableStyle={{ minWidth: "100%" }}
                        header={header}
                    >
                        <Column field="amountPaid" header="Cost"></Column>
                        <Column
                            body={(rowData) => {
                                console.log("rowData", rowData);
                                return <PurchasedListItem eventId={rowData?.resource?.noteId || rowData?.course?.noteId} category={rowData?.course ? "courses" : "resources"} />
                            }}
                            header="Name"
                        ></Column>
                        <Column body={session.user?.purchased?.some((item) => item.courseId) ? "course" : "resource"} header="Category"></Column>
                        <Column body={rowData => formatDateTime(rowData?.createdAt)} header="Date"></Column>
                    </DataTable>

                )}
                <UserContent />
            </div>
        )
    );
};

export default Profile;
