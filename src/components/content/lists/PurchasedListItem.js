import React, { useEffect, useState } from "react";
import { useNDKContext } from "@/context/NDKContext";
import { parseEvent } from "@/utils/nostr";
import { ProgressSpinner } from "primereact/progressspinner";

const PurchasedListItem = ({ eventId, category }) => {
    const { ndk } = useNDKContext();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;

            try {
                await ndk.connect();
                const event = await ndk.fetchEvent(eventId);
                if (event) {
                    setEvent(parseEvent(event));
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            }
        }
        fetchEvent();
    }, [eventId, ndk]);

    return !event || !ndk ? <ProgressSpinner className="w-[40px] h-[40px]" /> : (<a className="text-blue-500 underline hover:text-blue-600" href={category === "courses" ? `/courses/${event.id}` : `/details/${event.id}`}>{event.title}</a>);
}

export default PurchasedListItem;