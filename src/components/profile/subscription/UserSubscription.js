import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Message } from "primereact/message";
import { Card } from "primereact/card";
import SubscribeModal from "@/components/profile/subscription/SubscribeModal";

const UserSubscription = ({ user }) => {
    const [subscribeModalVisible, setSubscribeModalVisible] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [subscribedUntil, setSubscribedUntil] = useState(null);
    const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState(null);
    const menu = useRef(null);

    useEffect(() => {
        if (user && user.role) {
            setSubscribed(user.role.subscribed);
            const subscribedAt = new Date(user.role.lastPaymentAt);
            const subscribedUntil = new Date(subscribedAt.getTime() + 31 * 24 * 60 * 60 * 1000);
            setSubscribedUntil(subscribedUntil);
            if (user.role.subscriptionExpiredAt) {
                const expiredAt = new Date(user.role.subscriptionExpiredAt)
                setSubscriptionExpiredAt(expiredAt);
            }
        }
    }, [user]);

    const menuItems = [
        {
            label: "Renew Subscription",
            icon: "pi pi-bolt",
            command: () => {
                // Add your edit functionality here
            },
        },
        {
            label: "Schedule 1:1",
            icon: "pi pi-calendar",
            command: () => {
                // Add your edit functionality here
            },
        },
        {
            label: "Cancel Subscription",
            icon: "pi pi-trash",
            command: () => {
                // Add your delete functionality here
            },
        },
    ];

    const openSubscribeModal = () => {
        setSubscribeModalVisible(true);
    };

    const subscriptionCardTitle = (
        <div className="w-full flex flex-row justify-between items-center">
            <span className="text-xl text-900 font-bold text-white">Plebdevs Subscription</span>
            <i
                className="pi pi-ellipsis-h text-2xlcursor-pointer hover:opacity-75"
                onClick={(e) => menu.current.toggle(e)}
            ></i>
            <Menu model={menuItems} popup ref={menu} />
        </div>
    );

    return (
        <>
            <Card title={subscriptionCardTitle} className="w-fit m-8 mx-auto">
                {subscribed && (
                    <div className="flex flex-col">
                        <Message className="w-fit" severity="success" text="Subscribed!" />
                        <p className="mt-8">Thank you for your support 🎉</p>
                        <p className="text-sm text-gray-400">Pay-as-you-go subscription will renew on {subscribedUntil.toLocaleDateString()}</p>
                    </div>
                )}
                {(!subscribed && !subscriptionExpiredAt) && (
                    <div className="flex flex-col">
                        <Message className="w-fit" severity="info" text="You currently have no active subscription" />
                        <Button
                            label="Subscribe"
                            className="w-auto mt-8 text-[#f8f8ff]"
                            onClick={openSubscribeModal}
                        />
                    </div>
                )}
                {subscriptionExpiredAt && (
                    <div className="flex flex-col">
                        <Message className="w-fit" severity="warn" text={`Your subscription expired on ${subscriptionExpiredAt.toLocaleDateString()}`} />
                        <Button
                            label="Subscribe"
                            className="w-auto mt-8 text-[#f8f8ff]"
                            onClick={openSubscribeModal}
                        />
                    </div>
                )}
            </Card>
            <SubscribeModal
                visible={subscribeModalVisible}
                onHide={() => setSubscribeModalVisible(false)}
            />
        </>
    );
};

export default UserSubscription;
