import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { parseEvent } from "@/utils/nostr";
import EditPublishedDocumentForm from "@/components/forms/document/EditPublishedDocumentForm";
import EditPublishedVideoForm from "@/components/forms/video/EditPublishedVideoForm";
import CourseForm from "@/components/forms/course/CourseForm";
import CombinedResourceForm from "@/components/forms/CombinedResourceForm";
import { useNDKContext } from "@/context/NDKContext";
import { useToast } from "@/hooks/useToast";

export default function Edit() {
    const [event, setEvent] = useState(null);
    const {ndk, addSigner} = useNDKContext();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            const fetchEvent = async () => {
                await ndk.connect();

                const fetchedEvent = await ndk.fetchEvent(slug);

                if (fetchedEvent) {
                    const parsedEvent = parseEvent(fetchedEvent);
                    setEvent(parsedEvent);
                } else {
                    showToast('error', 'Error', 'Event not found.');
                }
            }

            fetchEvent();
        }
    }, [router.isReady, router.query, ndk, showToast]);

    return (
        <div className="w-[80vw] max-w-[80vw] mx-auto my-8 flex flex-col justify-center">
            <h2 className="text-center mb-8">Edit Published Event</h2>
            {event?.topics.includes('course') && <CourseForm draft={event} isPublished />}
            {event?.topics.includes('video') && !event?.topics.includes('document') && <EditPublishedVideoForm event={event} />}
            {event?.topics.includes('document') && !event?.topics.includes('video') && <EditPublishedDocumentForm event={event} />}
            {event?.topics.includes('video') && event?.topics.includes('document') && <CombinedResourceForm draft={event} isPublished />}
        </div>
    );
}
