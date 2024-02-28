import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useNostr } from "@/hooks/useNostr";
import { parseEvent } from "@/utils/nostr";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const MarkdownContent = ({ content }) => {
    return (
        <div>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {content}
            </ReactMarkdown>
        </div>
    );
};


const Course = () => {
    const [course, setCourse] = useState(null);

    const router = useRouter();
    const { fetchSingleEvent } = useNostr();

    const { slug } = router.query;

    useEffect(() => {
        const getCourse = async () => {
            if (slug) {
                const fetchedCourse = await fetchSingleEvent(slug);
                const formattedCourse = parseEvent(fetchedCourse);
                setCourse(formattedCourse);
            }
        };

        if (slug && !course) {
            getCourse();
        }
    }, [slug]);

    return (
        <div className="flex flex-col justify-center mx-12">
            <h1 className="my-6 text-3xl text-center font-bold">{course?.title}</h1>
            <h2 className="text-lg text-center whitespace-pre-line">{course?.summary}</h2>
            <div className="mx-auto my-6">
                {
                    course?.content && <MarkdownContent content={course?.content} />
                }
            </div>
        </div>
    );
}

export default Course;