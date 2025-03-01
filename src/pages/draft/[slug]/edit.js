import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import EditDraftDocumentForm from "@/components/forms/document/EditDraftDocumentForm";
import EditDraftVideoForm from "@/components/forms/video/EditDraftVideoForm";
import CourseForm from "@/components/forms/course/CourseForm";
import EditDraftCombinedResourceForm from "@/components/forms/combined/EditDraftCombinedResourceForm";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const Edit = () => {
    const [draft, setDraft] = useState(null);
    const router = useRouter();
    const { isAdmin, isLoading } = useIsAdmin();
    useEffect(() => {
        if (isLoading) return;

        if (!isAdmin) {
            router.push('/');
        }
    }, [isAdmin, router, isLoading]);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            axios.get(`/api/drafts/${slug}`)
                .then(res => {
                    setDraft(res.data);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [router.isReady, router.query]);

    return (
        <div className="w-full min-bottom-bar:w-[86vw] max-sidebar:w-[100vw] px-8 mx-auto my-8 flex flex-col justify-center">
            <h2 className="text-center mb-8">Edit Draft</h2>
            {draft?.type === 'course' && <CourseForm draft={draft} />}
            {draft?.type === 'video' && <EditDraftVideoForm draft={draft} />}
            {draft?.type === 'document' && <EditDraftDocumentForm draft={draft} />}
            {draft?.type === 'combined' && <EditDraftCombinedResourceForm draft={draft} />}
        </div>
    );
};

export default Edit;
