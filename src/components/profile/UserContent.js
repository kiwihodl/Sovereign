import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import MenuTab from "@/components/menutab/MenuTab";
import { useLocalStorageWithEffect } from "@/hooks/useLocalStorage";
import { useNostr } from "@/hooks/useNostr";
import ContentList from "@/components/content/lists/ContentList";
import { parseEvent } from "@/utils/nostr";
import { useToast } from "@/hooks/useToast";

const UserContent = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [drafts, setDrafts] = useState([]);
    const [user, setUser] = useLocalStorageWithEffect('user', {});
    const { fetchCourses, fetchResources, fetchWorkshops, events } = useNostr();
    const router = useRouter();
    const { showToast } = useToast();

    const contentItems = [
        { label: 'Published', icon: 'pi pi-verified' },
        { label: 'Drafts', icon: 'pi pi-file-edit' },
        { label: 'Resources', icon: 'pi pi-book' },
        { label: 'Workshops', icon: 'pi pi-video' },
        { label: 'Courses', icon: 'pi pi-desktop' }
    ];

    useEffect(() => {
        if (user && user.id) {
            fetchAllContent();
        }
    }, [user]);

    const fetchAllContent = async () => {
        try {
            // Fetch drafts from the database
            const draftsResponse = await axios.get(`/api/drafts/all/${user.id}`);
            const drafts = draftsResponse.data;

            // Fetch resources, workshops, and courses from Nostr
            fetchResources();
            fetchWorkshops();
            fetchCourses();

            if (drafts.length > 0) {
                setDrafts(drafts);
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Error', 'Failed to fetch content');
        }
    };

    const getContentByIndex = (index) => {
        switch (index) {
            case 0:
                return []
            case 1:
                return drafts;
            case 2:
                return events.resources.map(resource => {
                    const { id, content, title, summary, image, published_at } = parseEvent(resource);
                    return { id, content, title, summary, image, published_at };
                });
            case 3:
                return events.workshops.map(workshop => {
                    const { id, content, title, summary, image, published_at } = parseEvent(workshop);
                    return { id, content, title, summary, image, published_at };
                })
            case 4:
                return events.courses.map(course => {
                    const { id, content, title, summary, image, published_at } = parseEvent(course);
                    return { id, content, title, summary, image, published_at };
                })
            default:
                return [];
        }
    };

    return (
        <div className="w-[90vw] mx-auto max-tab:w-[100vw] max-mob:w-[100vw]">
            <div className="border-y-2 border-gray-300 mt-12">
                <h2 className="text-center my-4">Your Content</h2>
            </div>
            <div className="flex flex-row w-full justify-between px-4">
                <MenuTab items={contentItems} activeIndex={activeIndex} onTabChange={setActiveIndex} />
                <Button onClick={() => router.push('/create')} label="Create" severity="success" outlined className="mt-2" />
            </div>
            <div className="w-full mx-auto my-8">
                <div className="w-full mx-auto my-8">
                    {getContentByIndex(activeIndex).length > 0 && (
                        <ContentList content={getContentByIndex(activeIndex)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserContent;