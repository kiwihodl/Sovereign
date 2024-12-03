import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useNDKContext } from "@/context/NDKContext";
import { useSession } from 'next-auth/react';
import { parseCourseEvent } from "@/utils/nostr";
import { ProgressSpinner } from 'primereact/progressspinner';
import PublishedCourseForm from "@/components/forms/course/PublishedCourseForm";
import { useToast } from "@/hooks/useToast";

const EditCourse = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { ndk } = useNDKContext();
    const { data: session } = useSession();
    const { showToast } = useToast();

    useEffect(() => {
        if (!router.isReady || !session) return;

        const fetchCourse = async () => {
            try {
                const { slug } = router.query;
                await ndk.connect();
                const event = await ndk.fetchEvent({ "#d": [slug] });
                
                if (!event) {
                    showToast('error', 'Error', 'Course not found');
                    router.push('/dashboard');
                    return;
                }

                // Check if user is the author
                if (event.pubkey !== session.user.pubkey) {
                    showToast('error', 'Error', 'Unauthorized');
                    router.push('/dashboard');
                    return;
                }

                const parsedCourse = parseCourseEvent(event);
                setCourse(parsedCourse);
            } catch (error) {
                console.error('Error fetching course:', error);
                showToast('error', 'Error', 'Failed to fetch course');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [router.isReady, router.query, ndk, session, showToast, router]);

    if (loading) {
        return <div className="w-full h-full flex items-center justify-center"><ProgressSpinner /></div>;
    }

    if (!course) {
        return null;
    }

    return (
        <div className="w-[80vw] max-w-[80vw] mx-auto my-8 flex flex-col justify-center">
            <h2 className="text-center mb-8">Edit Course</h2>
            <PublishedCourseForm course={course} />
        </div>
    );
};

export default EditCourse;