import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from "primereact/progressspinner";
import PurchasedListItem from "@/components/profile/PurchasedListItem";
import { useNDKContext } from "@/context/NDKContext";
import { formatDateTime } from "@/utils/time";
import UserContent from "@/components/profile/UserContent";
import Image from "next/image";
import BitcoinConnectButton from "@/components/bitcoinConnect/BitcoinConnect";
import SubscribeModal from "@/components/profile/SubscribeModal";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [subscribeModalVisible, setSubscribeModalVisible] = useState(false); // Add this state
    const [subscribed, setSubscribed] = useState(false);
    const [subscribedUntil, setSubscribedUntil] = useState(null);
    const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState(null);

    const { data: session, status, update } = useSession();
    const { returnImageProxy } = useImageProxy();
    const { ndk } = useNDKContext();
    const menu = useRef(null);

    useEffect(() => {
        // Refetch the session when the component mounts
        update();
    }, []);

    useEffect(() => {
        if (session && session.user) {
            setUser(session.user);
            if (session.user.role) {
                setSubscribed(session.user.role.subscribed);
                const subscribedAt = new Date(session.user.role.lastPaymentAt);
                // The user is subscribed until the date in subscribedAt + 30 days
                const subscribedUntil = new Date(subscribedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
                setSubscribedUntil(subscribedUntil);
                if (session.user.role.subscriptionExpiredAt) {
                    const expiredAt = new Date(session.user.role.subscriptionExpiredAt)
                    setSubscriptionExpiredAt(expiredAt);
                }
            }
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

    const openSubscribeModal = () => {
        setSubscribeModalVisible(true);
    };

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
                        <h2 className="text-xl my-2">Connect Your Lightning Wallet</h2>
                        <BitcoinConnectButton />
                    </div>
                    <div className="flex flex-col w-1/2 mx-auto my-4 justify-between items-center border-2 border-gray-700 bg-[#121212] p-8 rounded-md">
                        {subscribed && (
                            <>
                                <Message severity="success" text="Subscribed!" />
                                <p className="mt-8">Thank you for your support 🎉</p>
                                <p className="text-sm text-gray-400">Pay-as-you-go subscription will renew on {subscribedUntil.toLocaleDateString()}</p>
                            </>
                        )}
                        {(!subscribed && !subscriptionExpiredAt) && (
                            <>
                                <Message severity="info" text="You currently have no active subscription" />
                                <Button
                                    label="Subscribe"
                                    className="w-auto mt-8 text-[#f8f8ff]"
                                    onClick={openSubscribeModal} // Add this onClick handler
                                />
                            </>
                        )}
                        {subscriptionExpiredAt && (
                            <>
                                <Message severity="warn" text={`Your subscription expired on ${subscriptionExpiredAt.toLocaleDateString()}`} />
                                <Button
                                    label="Subscribe"
                                    className="w-auto mt-8 text-[#f8f8ff]"
                                    onClick={openSubscribeModal} // Add this onClick handler
                                />
                            </>
                        )}
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
                <SubscribeModal
                    visible={subscribeModalVisible}
                    onHide={() => setSubscribeModalVisible(false)}
                />

            </div>
        )
    );
};

export default Profile;
