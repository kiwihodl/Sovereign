import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { useRouter } from "next/router";;
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/useToast";
import { useNDKContext } from "@/context/NDKContext";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import dynamic from 'next/dynamic';
const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    {
        ssr: false,
    }
);
import 'primeicons/primeicons.css';

const ResourceForm = ({ draft = null, isPublished = false }) => {
    const [title, setTitle] = useState(draft?.title || '');
    const [summary, setSummary] = useState(draft?.summary || '');
    const [isPaidResource, setIsPaidResource] = useState(draft?.price ? true : false);
    const [price, setPrice] = useState(draft?.price || 0);
    const [coverImage, setCoverImage] = useState(draft?.image || '');
    const [topics, setTopics] = useState(draft?.topics || ['']);
    const [content, setContent] = useState(draft?.content || '');
    const [user, setUser] = useState(null);

    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const router = useRouter();
    const ndk = useNDKContext();

    useEffect(() => {
        console.log('isPublished', isPublished);
        console.log('draft', draft);
    }, [isPublished, draft]);

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    const handleContentChange = useCallback((value) => {
        setContent(value || '');
    }, []);

    useEffect(() => {
        if (draft) {
            setTitle(draft.title);
            setSummary(draft.summary);
            setIsPaidResource(draft.price ? true : false);
            setPrice(draft.price || 0);
            setContent(draft.content);
            setCoverImage(draft.image);
            setTopics(draft.topics || []);
        }
    }, [draft]);

    const buildEvent = async (draft) => {
        const dTag = draft.d
        const event = new NDKEvent(ndk);
        let encryptedContent;

        if (draft?.price) {
            // encrypt the content with NEXT_PUBLIC_APP_PRIV_KEY to NEXT_PUBLIC_APP_PUBLIC_KEY
            encryptedContent = await nip04.encrypt(process.env.NEXT_PUBLIC_APP_PRIV_KEY, process.env.NEXT_PUBLIC_APP_PUBLIC_KEY, draft.content);
        }

        event.kind = draft?.price ? 30402 : 30023; // Determine kind based on if price is present
        event.content = draft?.price ? encryptedContent : draft.content;
        event.created_at = Math.floor(Date.now() / 1000);
        event.pubkey = user.pubkey;
        event.tags = [
            ['d', dTag],
            ['title', draft.title],
            ['summary', draft.summary],
            ['image', draft.image],
            ...draft.topics.map(topic => ['t', topic]),
            ['published_at', Math.floor(Date.now() / 1000).toString()],
            ...(draft?.price ? [['price', draft.price.toString()], ['location', `https://plebdevs.com/details/${draft.id}`]] : []),
        ];

        return event;
    };

    const handlePublishedResource = async (e) => {
        e.preventDefault();

        // create new object with state fields
        const updatedDraft = {
            title,
            summary,
            price,
            content,
            image: coverImage,
            topics: [...topics.map(topic => topic.trim().toLowerCase()), 'plebdevs', 'resource']
        }

        console.log('handlePublishedResource', updatedDraft);

        const event = await buildEvent(updatedDraft);

        console.log('event', event);

        try {
            await ndk.connect();

            const published = await ndk.publish(event);

            if (published) {
                showToast('success', 'Success', 'Resource published successfully.');
                router.push(`/resource/${event.id}`);
            } else {
                showToast('error', 'Error', 'Failed to publish resource. Please try again.');
            }
        } catch (error) {
            console.error(error);
            showToast('error', 'Error', 'Failed to publish resource. Please try again.');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userResponse = await axios.get(`/api/users/${user.pubkey}`);

        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const payload = {
            title,
            summary,
            type: 'resource',
            price: isPaidResource ? price : null,
            content,
            image: coverImage,
            topics: [...topics.map(topic => topic.trim().toLowerCase()), 'plebdevs', 'resource']
        };

        if (!draft) {
            // Only include user when creating a new draft
            payload.user = userResponse.data.id;
        }

        if (payload) {
            const url = draft ? `/api/drafts/${draft.id}` : '/api/drafts';
            const method = draft ? 'put' : 'post';

            axios[method](url, payload)
                .then(response => {
                    if (response.status === 200 || response.status === 201) {
                        showToast('success', 'Success', draft ? 'Resource updated successfully.' : 'Resource saved as draft.');

                        if (response.data?.id) {
                            router.push(`/draft/${response.data.id}`);
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    showToast('error', 'Error', 'Failed to save resource. Please try again.');
                });
        }
    };

    const handleTopicChange = (index, value) => {
        const updatedTopics = topics.map((topic, i) => i === index ? value : topic);
        setTopics(updatedTopics);
    };

    const addTopic = (e) => {
        e.preventDefault();
        setTopics([...topics, '']); // Add an empty string to the topics array
    };

    const removeTopic = (e, index) => {
        e.preventDefault();
        const updatedTopics = topics.filter((_, i) => i !== index);
        setTopics(updatedTopics);
    };

    return (
        <form onSubmit={isPublished && draft ? handlePublishedResource : handleSubmit}>
            <div className="p-inputgroup flex-1">
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="p-inputgroup flex-1 mt-4">
                <InputText value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
            </div>
            <div className="p-inputgroup flex-1 mt-4">
                <InputText value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover Image URL" />
            </div>

            <div className="p-inputgroup flex-1 mt-8 flex-col">
                <p className="py-2">Paid Resource</p>
                <InputSwitch checked={isPaidResource} onChange={(e) => setIsPaidResource(e.value)} />
                {isPaidResource && (
                    <div className="p-inputgroup flex-1 py-4">
                        <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>
            <div className="p-inputgroup flex-1 flex-col mt-4">
                <span>Content</span>
                <div data-color-mode="dark">
                    <MDEditor
                        value={content}
                        onChange={handleContentChange}
                        height={350}
                    />
                </div>
            </div>
            <div className="mt-8 flex-col w-full">
                {topics.map((topic, index) => (
                    <div className="p-inputgroup flex-1" key={index}>
                        <InputText value={topic} onChange={(e) => handleTopicChange(index, e.target.value)} placeholder="Topic" className="w-full mt-2" />
                        {index > 0 && (
                            <Button icon="pi pi-times" className="p-button-danger mt-2" onClick={(e) => removeTopic(e, index)} />
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-row items-end justify-end py-2">
                    <Button icon="pi pi-plus" onClick={addTopic} />
                </div>
            </div>
            <div className="flex justify-center mt-8">
                <Button type="submit" severity="success" outlined label={draft ? "Update" : "Submit"} />
            </div>
        </form>
    );
}

export default ResourceForm;
