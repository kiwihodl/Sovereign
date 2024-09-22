import React, { useRef, useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import { Column } from "primereact/column";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from "primereact/progressspinner";
import PurchasedListItem from "@/components/profile/PurchasedListItem";
import { useNDKContext } from "@/context/NDKContext";
import { formatDateTime } from "@/utils/time";
import { Tooltip } from "primereact/tooltip";
import { nip19 } from "nostr-tools";
import Image from "next/image";
import GithubContributionChart from "@/components/charts/GithubContributionChart";
import useWindowWidth from "@/hooks/useWindowWidth";
import { useToast } from "@/hooks/useToast";
import UserProgress from "@/components/profile/progress/UserProgress";

const UserProfile = () => {
    const windowWidth = useWindowWidth();
    const [user, setUser] = useState(null);
    const { data: session } = useSession();
    const { returnImageProxy } = useImageProxy();
    const { ndk, addSigner } = useNDKContext();
    const { showToast } = useToast();
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
                showToast("warn", "Alert", "This feature is not yet implemented");
            },
        },
        {
            label: "Delete",
            icon: "pi pi-trash",
            command: () => {
                showToast("warn", "Alert", "This feature is not yet implemented");
            },
        },
    ];

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold text-[#f8f8ff]">Progress</span>
        </div>
    );

    return (
        user && (
            <div className="p-4">
                {
                    windowWidth < 768 && (
                        <h1 className="text-3xl font-bold mb-6">Profile</h1>
                    )
                }
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
                        <Tooltip target=".pubkey-tooltip" content={"this is your nostr npub"} />
                        {nip19.npubEncode(user.pubkey)} <i className="pi pi-question-circle text-xl pubkey-tooltip" />
                    </h2>
                    <GithubContributionChart username={"austinkelsay"} />
                    <UserProgress />
                </div>
                {!session || !session?.user || !ndk ? (
                    <div className='w-full h-full flex items-center justify-center'><ProgressSpinner /></div>
                ) : (
                    <DataTable
                        emptyMessage="No Courses or Milestones completed"
                        value={session.user?.purchased}
                        header={header}
                        style={{ maxWidth: windowWidth < 768 ? "100%" : "90%", margin: "0 auto", borderRadius: "10px" }}
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
