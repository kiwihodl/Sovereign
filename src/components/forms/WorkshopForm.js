import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { useToast } from '@/hooks/useToast';
import { useLocalStorageWithEffect } from '@/hooks/useLocalStorage';
import 'primeicons/primeicons.css';

const WorkshopForm = ({ draft = null }) => {
    const [title, setTitle] = useState(draft?.title || '');
    const [summary, setSummary] = useState(draft?.summary || '');
    const [price, setPrice] = useState(draft?.price || 0);
    const [isPaidResource, setIsPaidResource] = useState(draft?.price ? true : false);
    const [videoUrl, setVideoUrl] = useState(draft?.content || '');
    const [coverImage, setCoverImage] = useState(draft?.image || '');
    const [topics, setTopics] = useState(draft?.topics || ['']);

    const router = useRouter();
    const [user] = useLocalStorageWithEffect('user', {});
    const { showToast } = useToast();

    useEffect(() => {
        if (draft) {
            setTitle(draft.title);
            setSummary(draft.summary);
            setPrice(draft.price || 0);
            setIsPaidResource(draft.price ? true : false);
            setVideoUrl(draft.content);
            setCoverImage(draft.image);
            setTopics(draft.topics || ['']);
        }
    }, [draft]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let embedCode = '';
    
        // Check if it's a YouTube video
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
            embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
        }
        // Check if it's a Vimeo video
        else if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.split('/').pop();
            embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><iframe src="https://player.vimeo.com/video/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
        }
        // Add more conditions here for other video services

        const userResponse = await axios.get(`/api/users/${user.pubkey}`);

        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }
    
        const payload = {
            title,
            summary,
            type: 'workshop',
            price: isPaidResource ? price : null,
            content: embedCode,
            image: coverImage,
            user: userResponse.data.id,
            topics: [...topics.map(topic => topic.trim().toLowerCase()), 'plebdevs', 'workshop']
        };

        if (payload && payload.user) {
            const url = draft ? `/api/drafts/${draft.id}` : '/api/drafts';
            const method = draft ? 'put' : 'post';

            axios[method](url, payload)
                .then(response => {
                    if (response.status === 200 || response.status === 201) {
                        showToast('success', 'Success', draft ? 'Workshop updated successfully.' : 'Workshop saved as draft.');

                        if (response.data?.id) {
                            router.push(`/draft/${response.data.id}`);
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    showToast('error', 'Error', 'Failed to save workshop. Please try again.');
                });
        }
    };

    const onUpload = (event) => {
        showToast('success', 'Success', 'File Uploaded');
        console.log(event.files[0]);
    }

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
        <form onSubmit={handleSubmit}>
            <div className="p-inputgroup flex-1">
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="p-inputgroup flex-1 mt-4">
                <InputText value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
            </div>

            <div className="p-inputgroup flex-1 mt-4 flex-col">
                <p className="py-2">Paid Workshop</p>
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
            <div className="mt-4 flex-col w-full">
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

export default WorkshopForm;
