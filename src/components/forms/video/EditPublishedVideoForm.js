import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { useNDKContext } from '@/context/NDKContext';
import GenericButton from '@/components/buttons/GenericButton';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { validateEvent } from '@/utils/nostr';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { useEncryptContent } from '@/hooks/encryption/useEncryptContent';

const EditPublishedVideoForm = ({ event }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();
    const { ndk, addSigner } = useNDKContext();
    const [user, setUser] = useState(null);
    const [title, setTitle] = useState(event.title);
    const [summary, setSummary] = useState(event.summary);
    const [price, setPrice] = useState(event.price);
    const [isPaidResource, setIsPaidResource] = useState(event.price ? true : false);
    const [videoUrl, setVideoUrl] = useState(event.content);
    const [coverImage, setCoverImage] = useState(event.image);
    const [additionalLinks, setAdditionalLinks] = useState(event.additionalLinks);
    const [topics, setTopics] = useState(event.topics);

    const { encryptContent } = useEncryptContent();

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    useEffect(() => {
        console.log("event", event);
    }, [event]);

    const addLink = () => {
        setAdditionalLinks([...additionalLinks, '']);
    }

    const removeLink = (e, index) => {
        setAdditionalLinks(additionalLinks.filter((_, i) => i !== index));
    }

    const addTopic = () => {
        setTopics([...topics, '']);
    }

    const removeTopic = (e, index) => {
        setTopics(topics.filter((_, i) => i !== index));
    }

    const handleLinkChange = (index, value) => {
        const newLinks = [...additionalLinks];
        newLinks[index] = value;
        setAdditionalLinks(newLinks);
    };

    const handleTopicChange = (index, value) => {
        const newTopics = [...topics];
        newTopics[index] = value;
        setTopics(newTopics);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!ndk.signer) {
                await addSigner();
            }

            let embedCode = '';

            // Generate embed code based on video URL
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
                embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
            } else if (videoUrl.includes('vimeo.com')) {
                const videoId = videoUrl.split('/').pop();
                embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://player.vimeo.com/video/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
            } else if ((price === undefined || price <= 0) && (videoUrl.includes('.mp4') || videoUrl.includes('.mov') || videoUrl.includes('.avi') || videoUrl.includes('.wmv') || videoUrl.includes('.flv') || videoUrl.includes('.webm'))) {
                embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="${CDN_ENDPOINT}/${videoUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" controls></video></div>`;
            } else if (videoUrl.includes('.mp4') || videoUrl.includes('.mov') || videoUrl.includes('.avi') || videoUrl.includes('.wmv') || videoUrl.includes('.flv') || videoUrl.includes('.webm')) {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
                const videoEmbed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="${baseUrl}/api/get-video-url?videoKey=${encodeURIComponent(videoUrl)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" controls></video></div>`;
                embedCode = videoEmbed;
            }

            // Encrypt content if it's a paid resource
            if (isPaidResource && price > 0) {
                embedCode = await encryptContent(embedCode);
                if (!embedCode) {
                    showToast('error', 'Error', 'Failed to encrypt content');
                    return;
                }
            }

            const ndkEvent = new NDKEvent(ndk);
            ndkEvent.kind = event.kind;
            ndkEvent.content = embedCode;
            ndkEvent.created_at = Math.floor(Date.now() / 1000);
            ndkEvent.pubkey = event.pubkey;
            ndkEvent.tags = [
                ['title', title],
                ['summary', summary],
                ['image', coverImage],
                ['t', 'video'],
                ['d', event.d],
            ];

            // Add topics
            topics.forEach(topic => {
                if (topic && topic !== 'video') {
                    ndkEvent.tags.push(['t', topic]);
                }
            });

            // Add additional links
            additionalLinks.forEach(link => {
                if (link) {
                    ndkEvent.tags.push(['r', link]);
                }
            });

            // Add price if it exists
            if (price) {
                ndkEvent.tags.push(['price', price.toString()]);
            }

            // Validate the event
            const validationResult = validateEvent(ndkEvent);
            if (validationResult !== true) {
                console.log("validationResult", validationResult);
                showToast('error', 'Error', validationResult);
                return;
            }

            // Publish the event
            const signedEvent = await ndk.publish(ndkEvent);

            if (signedEvent) {
                // update updated_at for resource in db
                const updatedResource = await axios.put(`/api/resources/${event.d}`, {
                    updatedAt: new Date().toISOString(),
                });

                if (updatedResource && updatedResource.status === 200) {
                    showToast('success', 'Success', 'Video updated successfully');
                    router.push(`/details/${updatedResource.data.noteId}`);
                } else {
                    showToast('error', 'Error', 'Failed to update video');
                }
            }
        } catch (error) {
            console.error('Error updating video:', error);
            showToast('error', 'Error', 'Failed to update video');
        }
    };

    return (
        <form onSubmit={(e) => handleSubmit(e)}>
            <div className="p-inputgroup flex-1">
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="p-inputgroup flex-1 mt-4">
                <InputTextarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" rows={5} cols={30} />
            </div>

            <div className="p-inputgroup flex-1 mt-4 flex-col">
                <p className="py-2">Paid Video</p>
                <InputSwitch checked={isPaidResource} onChange={(e) => setIsPaidResource(e.value)} />
                {isPaidResource && (
                    <div className="p-inputgroup flex-1 py-4">
                        <i className="pi pi-bolt p-inputgroup-addon text-2xl text-yellow-500"></i>
                        <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>
            <div className="p-inputgroup flex-1 mt-4">
                <InputText value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL" />
            </div>
            <div className="p-inputgroup flex-1 mt-4">
                <InputText value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover Image URL" />
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
                        <InputText value={link} onChange={(e) => handleLinkChange(index, e.target.value)} placeholder="https://example.com" className="w-full mt-2" />
                        {index > 0 && (
                            <GenericButton icon="pi pi-times" className="p-button-danger mt-2" onClick={(e) => removeLink(e, index)} />
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-row items-end justify-end py-2">
                    <GenericButton icon="pi pi-plus" onClick={addLink} />
                </div>
                <Tooltip target=".pi-info-circle" />
            </div>
            <div className="mt-4 flex-col w-full">
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
                <GenericButton type="submit" severity="success" outlined label={"Update"} />
            </div>
        </form>
    );
};

export default EditPublishedVideoForm;
