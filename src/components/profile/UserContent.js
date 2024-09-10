import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import MenuTab from "@/components/menutab/MenuTab";
import { useCourses } from "@/hooks/nostr/useCourses";
import { useResources } from "@/hooks/nostr/useResources";
import { useWorkshops } from "@/hooks/nostr/useWorkshops";
import { useDraftsQuery } from "@/hooks/apiQueries/useDraftsQuery";
import { useCourseDraftsQuery } from "@/hooks/apiQueries/useCourseDraftsQuery";
import { useContentIdsQuery } from "@/hooks/apiQueries/useContentIdsQuery";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/useToast";
import { Divider } from "primereact/divider";
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
    const { courses, coursesLoading, coursesError } = useCourses();
    const { resources, resourcesLoading, resourcesError } = useResources();
    const { workshops, workshopsLoading, workshopsError } = useWorkshops();
    const { courseDrafts, courseDraftsLoading, courseDraftsError } = useCourseDraftsQuery();
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
        { label: "Draft Courses", icon: "pi pi-book" },
        { label: "Resources", icon: "pi pi-file" },
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
                        return courseDrafts || [];
                    case 3:
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
    }, [activeIndex, isClient, drafts, resources, workshops, courses, publishedContent, courseDrafts])

    const isLoading = coursesLoading || resourcesLoading || workshopsLoading || draftsLoading || contentIdsLoading || courseDraftsLoading;
    const isError = coursesError || resourcesError || workshopsError || draftsError || contentIdsError || courseDraftsError;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">My Content</h1>
            <div className="flex flex-row w-full justify-between px-8 max-tab:flex-col max-tab:px-0">
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
            <Divider />
            <div className="w-full mx-auto my-8">
                <div className="w-full mx-auto px-8 max-tab:px-0">
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