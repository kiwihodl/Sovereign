import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ResourceForm from "@/components/forms/ResourceForm";
import WorkshopForm from "@/components/forms/WorkshopForm";
import CourseForm from "@/components/forms/course/CourseForm";

const Edit = () => {
    const [draft, setDraft] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            axios.get(`/api/drafts/${slug}`)
                .then(res => {
                    console.log('res:', res.data);
                    setDraft(res.data);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [router.isReady, router.query]);

    return (
        <div className="w-[80vw] max-w-[80vw] mx-auto my-8 flex flex-col justify-center">
            <h2 className="text-center mb-8">Edit Draft</h2>
            {draft?.type === 'course' && <CourseForm draft={draft} />}
            {draft?.type === 'workshop' && <WorkshopForm draft={draft} />}
            {draft?.type === 'resource' && <ResourceForm draft={draft} />}
        </div>
    );
};

export default Edit;
