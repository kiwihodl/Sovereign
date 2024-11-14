import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import GenericButton from "@/components/buttons/GenericButton";
import MenuTab from "@/components/menutab/MenuTab";
import { useCourses } from "@/hooks/nostr/useCourses";
import { useDocuments } from "@/hooks/nostr/useDocuments";
import { useVideos } from "@/hooks/nostr/useVideos";
import { useDraftsQuery } from "@/hooks/apiQueries/useDraftsQuery";
import { useCourseDraftsQuery } from "@/hooks/apiQueries/useCourseDraftsQuery";
import { useContentIdsQuery } from "@/hooks/apiQueries/useContentIdsQuery";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/useToast";
import { Divider } from "primereact/divider";
import useWindowWidth from "@/hooks/useWindowWidth";
import ContentList from "@/components/content/lists/ContentList";
import { parseEvent } from "@/utils/nostr";
import { ProgressSpinner } from "primereact/progressspinner";
import { useNDKContext } from "@/context/NDKContext";
import appConfig from "@/config/appConfig";

const UserContent = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [content, setContent] = useState([]);
    const [publishedContent, setPublishedContent] = useState([]);
    const windowWidth = useWindowWidth();
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const router = useRouter();
    const { showToast } = useToast();
    const {ndk, addSigner} = useNDKContext();
    const { courses, coursesLoading, coursesError } = useCourses();
    const { documents, documentsLoading, documentsError } = useDocuments();
    const { videos, videosLoading, videosError } = useVideos();
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
        { label: "Documents", icon: "pi pi-file" },
        { label: "Videos", icon: "pi pi-video" },
        { label: "Courses", icon: "pi pi-desktop" },
    ];

    useEffect(() => {
        const fetchAllContentFromNDK = async (ids) => {
            try {
                await ndk.connect();
                const filter = { "#d": ids, authors: appConfig.authorPubkeys };

                const uniqueEvents = new Set();

                const events = await ndk.fetchEvents(filter);
                
                events.forEach(event => {
                    uniqueEvents.add(event);
                });
                return Array.from(uniqueEvents);
            } catch (error) {
                console.error('Error fetching videos from NDK:', error);
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
                        return documents?.map(parseEvent) || [];
                    case 4:
                        return videos?.map(parseEvent) || [];
                    case 4:
                        return courses?.map(parseEvent) || [];
                    default:
                        return [];
                }
            };

            setContent(getContentByIndex(activeIndex));
        }
    }, [activeIndex, isClient, drafts, documents, videos, courses, publishedContent, courseDrafts])

    const isLoading = coursesLoading || documentsLoading || videosLoading || draftsLoading || contentIdsLoading || courseDraftsLoading;
    const isError = coursesError || documentsError || videosError || draftsError || contentIdsError || courseDraftsError;

    return (
        <div className="p-4">
            {
                windowWidth < 768 && (
                    <h1 className="text-3xl font-bold mb-6">My Content</h1>
                )
            }
            <div className="flex flex-row w-full justify-between px-8 max-tab:flex-col max-tab:px-0">
                <MenuTab
                    items={contentItems}
                    activeIndex={activeIndex}
                    onTabChange={setActiveIndex}
                />
                <GenericButton
                    onClick={() => router.push("/create")}
                    label="Create"
                    severity="success"
                    outlined
                    className="mt-2 max-tab:w-[50%]"
                />
            </div>
            <div className="w-full px-8 max-tab:px-0">
                <Divider />
            </div>
            <div className="w-full mx-auto my-8">
                <div className="w-full mx-auto px-8 max-tab:px-0">
                    {isLoading ? (
                        <div className='w-full h-full flex items-center justify-center'><ProgressSpinner /></div>
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