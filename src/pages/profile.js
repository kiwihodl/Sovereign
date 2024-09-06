import React, { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import UserProfile from "@/components/profile/UserProfile";
import UserSettings from "@/components/profile/UserSettings";
import UserContent from "@/components/profile/UserContent";
import UserSubscription from "@/components/profile/subscription/UserSubscription";
import { useRouter } from "next/router";

const Profile = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ["profile", "settings", "content", "subscribe"];

    useEffect(() => {
        const { tab } = router.query;
        if (tab) {
            const index = tabs.indexOf(tab.toLowerCase());
            if (index !== -1) {
                setActiveTab(index);
            }
        }
    }, [router.query]);

    const onTabChange = (e) => {
        const newIndex = e.index;
        setActiveTab(newIndex);
        router.push(`/profile?tab=${tabs[newIndex]}`, undefined, { shallow: true });
    };

    return (
        <div className="w-full min-h-full min-bottom-bar:w-[86vw] mx-auto">
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
                <TabPanel header="Settings" pt={{
                    headerAction: {
                        className: "bg-transparent"
                    },
                }}>
                    <UserSettings />
                </TabPanel>
                <TabPanel header="Content" pt={{
                    headerAction: {
                        className: "bg-transparent"
                    },
                }}>
                    <UserContent />
                </TabPanel>
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
