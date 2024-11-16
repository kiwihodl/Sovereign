import React, { useEffect, useState } from "react";
import { useNDKContext } from "@/context/NDKContext";
import { parseEvent } from "@/utils/nostr";
import { ProgressSpinner } from "primereact/progressspinner";
import { nip19 } from "nostr-tools";
import appConfig from "@/config/appConfig";

const PurchasedListItem = ({ eventId, category }) => {
    const { ndk } = useNDKContext();
    const [event, setEvent] = useState(null);
    const [naddr, setNaddr] = useState(null);

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

    useEffect(() => {
        if (event) {
            encodeNaddr();
        }
    }, [event]);

    const encodeNaddr = () => {
        setNaddr(nip19.naddrEncode({
            pubkey: event.pubkey,
            identifier: event.d,
            kind: event.kind,
            relays: appConfig.defaultRelayUrls
        }))
    }

    return !event || !ndk ? <ProgressSpinner className="w-[40px] h-[40px]" /> : (<a className="text-blue-500 underline hover:text-blue-600" href={category === "courses" ? `/course/${naddr}` : `/details/${naddr}`}>{event.title}</a>);
}

export default PurchasedListItem;