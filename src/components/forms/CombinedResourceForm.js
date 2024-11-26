import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import GenericButton from '@/components/buttons/GenericButton';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Tooltip } from 'primereact/tooltip';
import { useEncryptContent } from '@/hooks/encryption/useEncryptContent';
import { useNDKContext } from "@/context/NDKContext";
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
);

const CDN_ENDPOINT = process.env.NEXT_PUBLIC_CDN_ENDPOINT;

const CombinedResourceForm = ({ draft = null, isPublished = false }) => {
    const [title, setTitle] = useState(draft?.title || '');
    const [summary, setSummary] = useState(draft?.summary || '');
    const [price, setPrice] = useState(draft?.price || 0);
    const [isPaidResource, setIsPaidResource] = useState(draft?.price ? true : false);
    const [videoUrl, setVideoUrl] = useState(draft?.videoUrl || '');
    const [content, setContent] = useState(draft?.content || '');
    const [coverImage, setCoverImage] = useState(draft?.image || '');
    const [topics, setTopics] = useState(draft?.topics || ['']);
    const [additionalLinks, setAdditionalLinks] = useState(draft?.additionalLinks || ['']);
    const [user, setUser] = useState(null);

    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();
    const { ndk, addSigner } = useNDKContext();
    const { encryptContent } = useEncryptContent();

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    const handleContentChange = useCallback((value) => {
        setContent(value || '');
    }, []);

    const getVideoEmbed = (url) => {
        let embedCode = '';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1] || url.split('/').pop();
            embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
        } else if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://player.vimeo.com/video/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
        } else if (!price || !price > 0 && (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.wmv') || url.includes('.flv') || url.includes('.webm'))) {
            embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="${CDN_ENDPOINT}/${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" controls></video></div>`;
        } else if (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.wmv') || url.includes('.flv') || url.includes('.webm')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="${baseUrl}/api/get-video-url?videoKey=${encodeURIComponent(url)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" controls></video></div>`;
        }

        return embedCode;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userResponse = await axios.get(`/api/users/${user.pubkey}`);
        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const videoEmbed = videoUrl ? getVideoEmbed(videoUrl) : '';
        const combinedContent = `${videoEmbed}\n\n${content}`;

        const payload = {
            title,
            summary,
            type: 'combined',
            price: isPaidResource ? price : null,
            content: combinedContent,
            image: coverImage,
            user: userResponse.data.id,
            topics: [...new Set([...topics.map(topic => topic.trim().toLowerCase()), 'video', 'document'])],
            additionalLinks: additionalLinks.filter(link => link.trim() !== ''),
        };

        const url = draft ? `/api/drafts/${draft.id}` : '/api/drafts';
        const method = draft ? 'put' : 'post';

        try {
            const response = await axios[method](url, payload);
            if (response.status === 200 || response.status === 201) {
                showToast('success', 'Success', draft ? 'Content updated successfully.' : 'Content saved as draft.');
                if (response.data?.id) {
                    router.push(`/draft/${response.data.id}`);
                }
            }
        } catch (error) {
            console.error(error);
            showToast('error', 'Error', 'Failed to save content. Please try again.');
        }
    };

    const handleTopicChange = (index, value) => {
        const updatedTopics = topics.map((topic, i) => i === index ? value : topic);
        setTopics(updatedTopics);
    };

    const addTopic = (e) => {
        e.preventDefault();
        setTopics([...topics, '']);
    };

    const removeTopic = (e, index) => {
        e.preventDefault();
        const updatedTopics = topics.filter((_, i) => i !== index);
        setTopics(updatedTopics);
    };

    const handleAdditionalLinkChange = (index, value) => {
        const updatedAdditionalLinks = additionalLinks.map((link, i) => i === index ? value : link);
        setAdditionalLinks(updatedAdditionalLinks);
    };

    const addAdditionalLink = (e) => {
        e.preventDefault();
        setAdditionalLinks([...additionalLinks, '']);
    };

    const removeAdditionalLink = (e, index) => {
        e.preventDefault();
        const updatedAdditionalLinks = additionalLinks.filter((_, i) => i !== index);
        setAdditionalLinks(updatedAdditionalLinks);
    };

    const buildEvent = async (draft) => {
        const dTag = draft.d;
        const event = new NDKEvent(ndk);
        let encryptedContent;

        const videoEmbed = videoUrl ? getVideoEmbed(videoUrl) : '';
        const combinedContent = `${videoEmbed}\n\n${content}`;

        if (draft?.price) {
            encryptedContent = await encryptContent(combinedContent);
        }

        event.kind = draft?.price ? 30402 : 30023;
        event.content = draft?.price ? encryptedContent : combinedContent;
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

        const updatedDraft = {
            title,
            summary,
            price,
            content,
            videoUrl,
            d: draft.d,
            image: coverImage,
            topics: [...new Set([...topics.map(topic => topic.trim().toLowerCase()), 'video', 'document'])],
            additionalLinks: additionalLinks.filter(link => link.trim() !== '')
        };

        const event = await buildEvent(updatedDraft);

        try {
            if (!ndk.signer) {
                await addSigner();
            }

            await ndk.connect();

            const published = await ndk.publish(event);

            if (published) {
                const response = await axios.put(`/api/resources/${draft.d}`, { noteId: event.id });
                showToast('success', 'Success', 'Content published successfully.');
                router.push(`/details/${event.id}`);
            } else {
                showToast('error', 'Error', 'Failed to publish content. Please try again.');
            }
        } catch (error) {
            console.error(error);
            showToast('error', 'Error', 'Failed to publish content. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-inputgroup flex-1">
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            
            <div className="p-inputgroup flex-1 mt-4">
                <InputTextarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" rows={5} cols={30} />
            </div>

            <div className="p-inputgroup flex-1 mt-4 flex-col">
                <p className="py-2">Paid Resource</p>
                <InputSwitch checked={isPaidResource} onChange={(e) => setIsPaidResource(e.value)} />
                {isPaidResource && (
                    <div className="p-inputgroup flex-1 py-4">
                        <i className="pi pi-bolt p-inputgroup-addon text-2xl text-yellow-500"></i>
                        <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>

            <div className="p-inputgroup flex-1 mt-4">
                <InputText value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL (YouTube, Vimeo, or direct video link)" />
            </div>

            <div className="p-inputgroup flex-1 mt-4">
                <InputText value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover Image URL" />
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
                <span className="pl-1 flex items-center">
                    External Links
                    <i className="pi pi-info-circle ml-2 cursor-pointer" 
                       data-pr-tooltip="Add any relevant external links that pair with this content (these links are currently not encrypted for 'paid' content)"
                       data-pr-position="right"
                       data-pr-at="right+5 top"
                       data-pr-my="left center-2"
                       style={{ fontSize: '1rem', color: 'var(--primary-color)' }}
                    />
                </span>
                {additionalLinks.map((link, index) => (
                    <div className="p-inputgroup flex-1" key={index}>
                        <InputText value={link} onChange={(e) => handleAdditionalLinkChange(index, e.target.value)} placeholder="https://plebdevs.com" className="w-full mt-2" />
                        {index > 0 && (
                            <GenericButton icon="pi pi-times" className="p-button-danger mt-2" onClick={(e) => removeAdditionalLink(e, index)} />
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-row items-end justify-end py-2">
                    <GenericButton icon="pi pi-plus" onClick={addAdditionalLink} />
                </div>
                <Tooltip target=".pi-info-circle" />
            </div>
            <div className="mt-8 flex-col w-full">
                {topics.map((topic, index) => (
                    <div className="p-inputgroup flex-1" key={index}>
                        <InputText value={topic} onChange={(e) => handleTopicChange(index, e.target.value)} placeholder="Topic" className="w-full mt-2" />
                        {index > 0 && (
                            <GenericButton icon="pi pi-times" className="p-button-danger mt-2" onClick={(e) => removeTopic(e, index)} />
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-row items-end justify-end py-2">
                    <GenericButton icon="pi pi-plus" onClick={addTopic} />
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <GenericButton type="submit" severity="success" outlined label={draft ? "Update" : "Submit"} />
            </div>
        </form>
    );
};

export default CombinedResourceForm;
