import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from "primereact/progressspinner";
import { useNDKContext } from "@/context/NDKContext";
import Image from "next/image";
import BitcoinConnectButton from "@/components/bitcoinConnect/BitcoinConnect";

const UserSettings = () => {
    const [user, setUser] = useState(null);
    const { data: session } = useSession();
    const { returnImageProxy } = useImageProxy();
    const { ndk } = useNDKContext();

    useEffect(() => {
        if (session?.user) {
            setUser(session.user);
        }
    }, [session]);

    const relayUrls = [
        "wss://nos.lol/",
        "wss://relay.damus.io/",
        "wss://relay.snort.social/",
        "wss://relay.nostr.band/",
        "wss://nostr.mutinywallet.com/",
        "wss://relay.mutinywallet.com/",
        "wss://relay.primal.net/"
    ];

    const relayStatusBody = (url) => {
        // Placeholder for relay status, replace with actual logic later
        const isConnected = Math.random() > 0.5;
        return (
            <i className={`pi ${isConnected ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'}`}></i>
        );
    };

    const relayActionsBody = () => {
        return (
            <div>
                <Button icon="pi pi-plus" className="p-button-rounded p-button-success p-button-text mr-2" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" />
            </div>
        );
    };

    const header = (
        <div className="flex flex-row justify-between">
            <span className="text-xl text-900 font-bold text-[#f8f8ff]">Relays</span>
            <Button icon="pi pi-plus" className="p-button-rounded p-button-success p-button-text mr-2" />
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
                    </div>

                    <h1 className="text-center text-2xl my-2">
                        {user.username || user?.email || "Anon"}
                    </h1>
                    <h2 className="text-center text-xl my-2 truncate max-tab:px-4 max-mob:px-4">
                        {user.pubkey}
                    </h2>
                    <div className="flex flex-col w-1/2 mx-auto my-8 mb-12 justify-between items-center">
                        <h2 className="text-xl my-2">Connect Your Lightning Wallet</h2>
                        <BitcoinConnectButton />
                    </div>
                </div>
                {!session || !session?.user || !ndk ? (
                    <ProgressSpinner />
                ) : (
                        <DataTable value={relayUrls}
                            style={{ maxWidth: "90%", margin: "0 auto", borderRadius: "10px" }}
                            header={header}
                            pt={{
                                wrapper: {
                                    className: "rounded-lg rounded-t-none"
                                },
                                header: {
                                    className: "rounded-t-lg"
                                }
                            }}
                        >
                            <Column field={(url) => url} header="Relay URL"></Column>
                            <Column body={relayStatusBody} header="Status"></Column>
                            <Column body={relayActionsBody} header="Actions"></Column>
                        </DataTable>
                )}
            </div>
        )
    );
};

export default UserSettings;
