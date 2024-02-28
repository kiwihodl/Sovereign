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


const Resource = () => {
    const [resource, setResource] = useState(null);

    const router = useRouter();
    const { fetchSingleEvent } = useNostr();

    const { slug } = router.query;

    console.log('slug:', slug);

    useEffect(() => {
        const getResource = async () => {
            if (slug) {
                const fetchedResource = await fetchSingleEvent(slug);
                console.log('fetchedResource:', fetchedResource);
                const formattedResource = parseEvent(fetchedResource);
                console.log('formattedResource:', formattedResource.summary);
                setResource(formattedResource);
            }
        };

        if (slug && !resource) {
            getResource();
        }
    }, [slug]);

    return (
        <div className="flex flex-col justify-center mx-12">
            <h1 className="my-6 text-3xl text-center font-bold">{resource?.title}</h1>
            <h2 className="text-lg text-center whitespace-pre-line">{resource?.summary}</h2>
            <div className="mx-auto my-6">
                {
                    resource?.content && <MarkdownContent content={resource?.content} />
                }
            </div>
        </div>
    );
}

export default Resource;