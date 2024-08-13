import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import MenuTab from "@/components/menutab/MenuTab";
import { useCoursesQuery } from "@/hooks/nostrQueries/content/useCoursesQuery";
import { useResourcesQuery } from "@/hooks/nostrQueries/content/useResourcesQuery";
import { useWorkshopsQuery } from "@/hooks/nostrQueries/content/useWorkshopsQuery";
import { useDraftsQuery } from "@/hooks/apiQueries/useDraftsQuery";
import { useContentIdsQuery } from "@/hooks/apiQueries/useContentIdsQuery";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/useToast";
import ContentList from "@/components/content/lists/ContentList";
import { parseEvent } from "@/utils/nostr";
import { useNDKContext } from "@/context/NDKContext";

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

const UserContent = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [content, setContent] = useState([]);
    const [publishedContent, setPublishedContent] = useState([]);

    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const router = useRouter();
    const { showToast } = useToast();
    const {ndk, addSigner} = useNDKContext();
    const { courses, coursesLoading, coursesError } = useCoursesQuery();
    const { resources, resourcesLoading, resourcesError } = useResourcesQuery();
    const { workshops, workshopsLoading, workshopsError } = useWorkshopsQuery();
    const { drafts, draftsLoading, draftsError } = useDraftsQuery();
    const { contentIds, contentIdsLoading, contentIdsError, refetchContentIds } = useContentIdsQuery();

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const contentItems = [
        { label: "Published", icon: "pi pi-verified" },
        { label: "Drafts", icon: "pi pi-file-edit" },
        { label: "Resources", icon: "pi pi-book" },
        { label: "Workshops", icon: "pi pi-video" },
        { label: "Courses", icon: "pi pi-desktop" },
    ];

    useEffect(() => {
        const fetchAllContentFromNDK = async (ids) => {
            try {
                await ndk.connect();
                const filter = { "#d": ids, authors: [AUTHOR_PUBKEY] };

                const uniqueEvents = new Set();

                const events = await ndk.fetchEvents(filter);
                
                events.forEach(event => {
                    uniqueEvents.add(event);
                });

                console.log('uniqueEvents', uniqueEvents)
                return Array.from(uniqueEvents);
            } catch (error) {
                console.error('Error fetching workshops from NDK:', error);
                return [];
            }
        };

        const fetchContent = async () => {
            if (contentIds && isClient) {
                const content = await fetchAllContentFromNDK(contentIds);
                setPublishedContent(content);
            }
        }
        fetchContent();
    }, [contentIds, isClient, ndk]);

    useEffect(() => {
        if (isClient) {
            const getContentByIndex = (index) => {
                switch (index) {
                    case 0:
                        return publishedContent.map(parseEvent) || [];
                    case 1:
                        return drafts || [];
                    case 2:
                        return resources?.map(parseEvent) || [];
                    case 3:
                        return workshops?.map(parseEvent) || [];
                    case 4:
                        return courses?.map(parseEvent) || [];
                    default:
                        return [];
                }
            };

            setContent(getContentByIndex(activeIndex));
        }
    }, [activeIndex, isClient, drafts, resources, workshops, courses, publishedContent])

    const isLoading = coursesLoading || resourcesLoading || workshopsLoading || draftsLoading || contentIdsLoading;
    const isError = coursesError || resourcesError || workshopsError || draftsError || contentIdsError;

    return (
        <div className="w-[90vw] mx-auto max-tab:w-[100vw] max-mob:w-[100vw]">
            <div className="border-y-2 border-gray-300 mt-12">
                <h2 className="text-center my-4">Your Content</h2>
            </div>
            <div className="flex flex-row w-full justify-between px-4">
                <MenuTab
                    items={contentItems}
                    activeIndex={activeIndex}
                    onTabChange={setActiveIndex}
                />
                <Button
                    onClick={() => router.push("/create")}
                    label="Create"
                    severity="success"
                    outlined
                    className="mt-2"
                />
            </div>
            <div className="w-full mx-auto my-8">
                <div className="w-full mx-auto my-8">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : isError ? (
                        <p>Error loading content.</p>
                    ) : content.length > 0 ? (
                        <ContentList content={content} />
                    ) : (
                        <p>No content available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserContent;