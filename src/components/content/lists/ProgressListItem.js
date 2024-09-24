import React, { useEffect, useState } from "react";
import { useNDKContext } from "@/context/NDKContext";
import { parseCourseEvent } from "@/utils/nostr";
import { ProgressSpinner } from "primereact/progressspinner";
import { nip19 } from "nostr-tools";
import appConfig from "@/config/appConfig";

const ProgressListItem = ({ dTag, category }) => {
    const { ndk } = useNDKContext();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!dTag) return;

            try {
                await ndk.connect();
                const filter = {
                    kinds: [30004],
                    "#d": [dTag]
                }
                const event = await ndk.fetchEvent(filter);
                if (event) {
                    setEvent(parseCourseEvent(event));
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            }
        }
        fetchEvent();
    }, [dTag, ndk]);

    const encodeNaddr = () => {
        return nip19.naddrEncode({
            pubkey: event.pubkey,
            identifier: event.id,
            kind: 30004,
            relayUrls: appConfig.defaultRelayUrls
        })
    }

    const renderContent = () => {
        if (!event) return null;

        if (category === "name") {
            return (
                <a className="text-blue-500 underline hover:text-blue-600" href={`/course/${encodeNaddr()}`}>
                    {event.name}
                </a>
            );
        } else if (category === "lessons") {
            const lessonsLength = event.tags.filter(tag => tag[0] === "a").length;
            return <span>{lessonsLength}</span>;
        }

        return null;
    }

    return !event || !ndk || !dTag ? (
        <ProgressSpinner className="w-[40px] h-[40px]" />
    ) : (
        renderContent()
    );
}

export default ProgressListItem;