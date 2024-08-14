import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { parseEvent } from "@/utils/nostr";
import ResourceForm from "@/components/forms/ResourceForm";
import WorkshopForm from "@/components/forms/WorkshopForm";
import CourseForm from "@/components/forms/CourseForm";
import { useNDKContext } from "@/context/NDKContext";
import { useToast } from "@/hooks/useToast";

export default function Edit() {
    const [event, setEvent] = useState(null);
    const [draft, setDraft] = useState(null);
    const { ndk, addSigner } = useNDKContext();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;
            const fetchEvent = async () => {
                // await ndk.connect();
                // const fetchedEvent = await ndk.fetchEvent(slug);
                // if (fetchedEvent) {
                //     const parsedEvent = parseEvent(fetchedEvent);
                //     console.log('parsedEvent:', parsedEvent);
                //     setEvent(parsedEvent);
                // } else {
                    // If no event found, try to fetch draft
                    try {
                        console.log('fetching draft:', slug);
                        const response = await axios.get(`/api/courses/drafts/${slug}`);
                        console.log('response:', response);
                        if (response.status === 200) {
                            setDraft(response.data);
                        } else {
                            showToast('error', 'Error', 'Draft not found.');
                        }
                    } catch (error) {
                        console.error('Error fetching draft:', error);
                        showToast('error', 'Error', 'Failed to fetch draft.');
                    }
                // }
            }
            fetchEvent();
        }
    }, [router.isReady, router.query, ndk, showToast]);

    return (
        <div className="w-[80vw] max-w-[80vw] mx-auto my-8 flex flex-col justify-center">
            <h2 className="text-center mb-8">Edit {event ? 'Published Event' : 'Draft'}</h2>
            {draft && 
                <CourseForm 
                    draft={draft}  
                    // isPublished
                />
            }
        </div>
    );
}