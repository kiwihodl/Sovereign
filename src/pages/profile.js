import React, { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import UserProfile from "@/components/profile/UserProfile";
import UserContent from "@/components/profile/UserContent";
import UserSubscription from "@/components/profile/subscription/UserSubscription";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { ProgressSpinner } from "primereact/progressspinner";

//todo: Link below connect wallet, relays hidden in ... (open modal)
const Profile = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState(0);
    const {isAdmin, isLoading} = useIsAdmin();
    
    const tabs = ["profile", "content", "subscribe"];

    useEffect(() => {
        const { tab } = router.query;
        if (tab) {
            const index = tabs.indexOf(tab.toLowerCase());
            if (index !== -1) {
                setActiveTab(index);
            }
        }
    }, [router.query]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    const onTabChange = (e) => {
        const newIndex = e.index;
        setActiveTab(newIndex);
        router.push(`/profile?tab=${tabs[newIndex]}`, undefined, { shallow: true });
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className='w-full h-full flex items-center justify-center'><ProgressSpinner /></div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

    if (!session) return null;

    return (
        <div className="w-full min-h-full mx-auto px-10">
            <TabView
                pt={{
                    root: {
                        className: "bg-transparent",
                    },
                    panelContainer: {
                        className: "bg-transparent m-0 p-0"
                    }
                }}
                onTabChange={onTabChange}
                activeIndex={activeTab}
            >
                <TabPanel header="Profile" pt={{
                    headerAction: {
                        className: "bg-transparent"
                    },
                }}>
                    <UserProfile />
                </TabPanel>
                {isAdmin && (
                    <TabPanel header="Content" pt={{
                        headerAction: {
                        className: "bg-transparent"
                    },
                }}>
                        <UserContent />
                    </TabPanel>
                )}
                <TabPanel header="Subscribe" pt={{
                    headerAction: {
                        className: "bg-transparent"
                    },
                }}>
                    <UserSubscription />
                </TabPanel>
            </TabView>
        </div>
    );
};

export default Profile;
