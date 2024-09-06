import React, { useRef, useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Column } from "primereact/column";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from "primereact/progressspinner";
import PurchasedListItem from "@/components/profile/PurchasedListItem";
import { useNDKContext } from "@/context/NDKContext";
import { formatDateTime } from "@/utils/time";
import { findKind0Fields } from "@/utils/nostr";
import Image from "next/image";
import BitcoinConnectButton from "@/components/bitcoinConnect/BitcoinConnect";
import UserContent from "@/components/profile/UserContent";
import SubscribeModal from "@/components/profile/subscription/SubscribeModal";
const UserProfile = () => {
    const [user, setUser] = useState(null);
    const { data: session } = useSession();
    const { returnImageProxy } = useImageProxy();
    const { ndk, addSigner } = useNDKContext();
    const menu = useRef(null);

    useEffect(() => {
        if (session?.user) {
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
            <span className="text-xl text-900 font-bold text-[#f8f8ff]">Purchases</span>
        </div>
    );

    return (
        user && (
            <div className="h-full w-full min-bottom-bar:w-[87vw] max-sidebar:w-[100vw] mx-auto">
                <div className="w-full flex flex-col justify-center mx-auto">
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
                        {user.username || user?.email || "Anon"}
                    </h1>
                    <h2 className="text-center text-xl my-2 truncate max-tab:px-4 max-mob:px-4">
                        {user.pubkey}
                    </h2>
                    {user && (
                        <SubscribeModal user={user} />
                    )}
                </div>
                {!session || !session?.user || !ndk ? (
                    <ProgressSpinner />
                ) : (
                    <DataTable
                        emptyMessage="No purchases"
                        value={session.user?.purchased}
                        header={header}
                        style={{ maxWidth: "90%", margin: "0 auto", borderRadius: "10px" }}
                        pt={{
                            wrapper: {
                                className: "rounded-lg rounded-t-none"
                            },
                            header: {
                                className: "rounded-t-lg"
                            }
                        }}
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
            </div>
        )
    );
};

export default UserProfile;
