import React, { useState, useEffect } from "react";
import UserProfileCard from "@/components/profile/UserProfileCard";
import { useSession } from 'next-auth/react';
import { useNDKContext } from "@/context/NDKContext";
import useWindowWidth from "@/hooks/useWindowWidth";
import UserRelaysTable from "@/components/profile/DataTables/UserRelaysTable";
import UserAccountLinking from "@/components/profile/UserAccountLinking";
const UserSettings = () => {
    const [user, setUser] = useState(null);
    const { ndk, userRelays, setUserRelays, reInitializeNDK } = useNDKContext();
    const { data: session } = useSession();
    const windowWidth = useWindowWidth();

    useEffect(() => {
        if (session?.user) {
            setUser(session.user);
        }
    }, [session]);

    return (
        user && (
            <div className="p-4">
                {windowWidth < 768 && (
                    <h1 className="text-3xl font-bold mb-6">Settings</h1>
                )}
                <div className="w-full flex flex-row max-lap:flex-col">
                    <div className="w-[22%] h-full max-lap:w-full">
                        <UserProfileCard user={user} />

                        {user && <UserAccountLinking session={session} />}
                    </div>

                    <div className="w-[78%] flex flex-col justify-center mx-2 max-lap:mx-0 max-lap:w-full">
                        <UserRelaysTable 
                            ndk={ndk}
                            userRelays={userRelays}
                            setUserRelays={setUserRelays}
                            reInitializeNDK={reInitializeNDK}
                        />
                    </div>
                </div>
            </div>
        )
    );
};

export default UserSettings;
