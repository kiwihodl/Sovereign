import React, { useState } from 'react';
import axios from 'axios';
import router from 'next/router';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { useToast } from '@/hooks/useToast';
import { useLocalStorageWithEffect } from '@/hooks/useLocalStorage';
import 'primeicons/primeicons.css';

const WorkshopForm = () => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [price, setPrice] = useState(0);
    const [isPaidResource, setIsPaidResource] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [topics, setTopics] = useState(['']);

    const router = useRouter();

    const [user] = useLocalStorageWithEffect('user', {});

    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let embedCode = '';
    
        // Check if it's a YouTube video
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
            embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
        // Check if it's a Vimeo video
        else if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.split('/').pop();
            embedCode = `<iframe width="560" height="315" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
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
            axios.post('/api/drafts', payload)
                .then(response => {
                    if (response.status === 201) {
                        showToast('success', 'Success', 'Workshop saved as draft.');

                        if (response.data?.id) {
                            router.push(`/draft/${response.data.id}`);
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
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

    const addTopic = () => {
        setTopics([...topics, '']); // Add an empty string to the topics array
    };

    const removeTopic = (index) => {
        const updatedTopics = topics.filter((_, i) => i !== index);
        setTopics(updatedTopics);
    };
    

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-inputgroup flex-1">
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="p-inputgroup flex-1 mt-8">
                <InputText value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
            </div>

            <div className="p-inputgroup flex-1 mt-8 flex-col">
                <p className="py-2">Paid Workshop</p>
                <InputSwitch checked={isPaidResource} onChange={(e) => setIsPaidResource(e.value)} />
                {isPaidResource && (
                    <div className="p-inputgroup flex-1 py-4">
                        <i className="pi pi-bolt p-inputgroup-addon text-2xl text-yellow-500"></i>
                        <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>
            <div className="p-inputgroup flex-1 mt-8">
                <InputText value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL" />
            </div>
            <div className="p-inputgroup flex-1 mt-8">
                <InputText value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover Image URL" />
            </div>
            <div className="mt-8 flex-col w-full">
                {topics.map((topic, index) => (
                    <div className="p-inputgroup flex-1" key={index}>
                        <InputText value={topic} onChange={(e) => handleTopicChange(index, e.target.value)} placeholder="Topic" className="w-full mt-2" />
                        {index > 0 && (
                            <Button icon="pi pi-times" className="p-button-danger mt-2" onClick={() => removeTopic(index)} />
                        )}
                    </div>
                ))}
                <div className="w-full flex flex-row items-end justify-end py-2">
                    <Button icon="pi pi-plus" onClick={addTopic} />
                </div>
            </div>
            <div className="flex justify-center mt-8">
                <Button type="submit" severity="success" outlined label="Submit" />
            </div>
        </form>
    );
}

export default WorkshopForm;
