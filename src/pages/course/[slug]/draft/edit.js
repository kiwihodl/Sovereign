import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import CourseForm from "@/components/forms/course/CourseForm";
import { useNDKContext } from "@/context/NDKContext";
import { useToast } from "@/hooks/useToast";

export default function Edit() {
    const [draft, setDraft] = useState(null);
    const { ndk } = useNDKContext();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;
            const fetchDraft = async () => {
                try {
                    const response = await axios.get(`/api/courses/drafts/${slug}`);
                    if (response.status === 200) {
                        setDraft(response.data);
                    } else {
                        showToast('error', 'Error', 'Draft not found.');
                    }
                } catch (error) {
                    console.error('Error fetching draft:', error);
                    showToast('error', 'Error', 'Failed to fetch draft.');
                }
            }
            fetchDraft();
        }
    }, [router.isReady, router.query, showToast]);

    return (
        <div className="w-[80vw] max-w-[80vw] mx-auto my-8 flex flex-col justify-center">
            <h2 className="text-center mb-8">Edit Course Draft</h2>
            {draft && <CourseForm draft={draft} />}
        </div>
    );
}