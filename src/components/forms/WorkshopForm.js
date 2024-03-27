import React, { useState } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { FileUpload } from 'primereact/fileupload';
import { verifyEvent, nip19 } from "nostr-tools"
import { useNostr } from '@/hooks/useNostr';
import { Button } from 'primereact/button';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/useToast';
import { useLocalStorageWithEffect } from '@/hooks/useLocalStorage';
import 'primeicons/primeicons.css';

const WorkshopForm = () => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [checked, setChecked] = useState(false);
    const [price, setPrice] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [topics, setTopics] = useState(['']);

    const [user] = useLocalStorageWithEffect('user', {});

    const { showToast } = useToast();

    const { publishAll } = useNostr();

    const handleSubmit = (e) => {
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
    
        const payload = {
            title,
            summary,
            isPaidResource: checked,
            price: checked ? price : null,
            embedCode,
            topics: [...topics.map(topic => topic.trim().toLowerCase()), 'plebdevs', 'workshop']
        };
        console.log(payload);

        if (checked) {
            broadcastPaidWorkshop(payload);
        } else {
            broadcastFreeWorkshop(payload);
        }
    };

    const broadcastFreeWorkshop = async (payload) => {
        const newWorkshopId = uuidv4();
        const event = {
            kind: 30023,
            content: payload.embedCode,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ['d', newWorkshopId],
                ['title', payload.title],
                ['summary', payload.summary],
                ['image', ''],
                ['t', ...topics],
                ['published_at', Math.floor(Date.now() / 1000).toString()],
            ]
        };

        const signedEvent = await window.nostr.signEvent(event);

        const eventVerification = await verifyEvent(signedEvent);

        if (!eventVerification) {
            showToast('error', 'Error', 'Event verification failed. Please try again.');
            return;
        }

        const nAddress = nip19.naddrEncode({
            pubkey: signedEvent.pubkey,
            kind: signedEvent.kind,
            identifier: newWorkshopId,
        })

        console.log('nAddress:', nAddress);

        const userResponse = await axios.get(`/api/users/${user.pubkey}`)

        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const resourcePayload = {
            id: newWorkshopId,
            userId: userResponse.data.id,
            price: 0,
            noteId: nAddress,
        }
        const response = await axios.post(`/api/resources`, resourcePayload);

        console.log('response:', response);

        if (response.status !== 201) {
            showToast('error', 'Error', 'Failed to create resource. Please try again.');
            return;
        }

        const publishResponse = await publishAll(signedEvent);

        if (!publishResponse) {
            showToast('error', 'Error', 'Failed to publish resource. Please try again.');
            return;
        } else if (publishResponse?.failedRelays) {
            publishResponse?.failedRelays.map(relay => {
                showToast('warn', 'Warning', `Failed to publish to relay: ${relay}`);
            });
        }

        publishResponse?.successfulRelays.map(relay => {
            showToast('success', 'Success', `Published to relay: ${relay}`);
        })
    }

    // For images, whether included in the markdown content or not, clients SHOULD use image tags as described in NIP-58. This allows clients to display images in carousel format more easily.
    const broadcastPaidWorkshop = async (payload) => {
        // encrypt the content with NEXT_PUBLIC_APP_PRIV_KEY to NEXT_PUBLIC_APP_PUBLIC_KEY
        const encryptedContent = await nip04.encrypt(process.env.NEXT_PUBLIC_APP_PRIV_KEY ,process.env.NEXT_PUBLIC_APP_PUBLIC_KEY, payload.content);
        const newWorkshopId = uuidv4();
        const event = {
            kind: 30402,
            content: encryptedContent,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ['title', payload.title],
                ['summary', payload.summary],
                ['t', ...topics],
                ['image', ''],
                ['d', newresourceId],
                ['location', `https://plebdevs.com/resource/${newWorkshopId}`],
                ['published_at', Math.floor(Date.now() / 1000).toString()],
                ['price', payload.price]
            ]
        };

        const signedEvent = await window.nostr.signEvent(event);

        const eventVerification = await verifyEvent(signedEvent);

        if (!eventVerification) {
            showToast('error', 'Error', 'Event verification failed. Please try again.');
            return;
        }

        const nAddress = nip19.naddrEncode({
            pubkey: signedEvent.pubkey,
            kind: signedEvent.kind,
            identifier: newWorkshopId,
        })

        console.log('nAddress:', nAddress);

        const userResponse = await axios.get(`/api/users/${user.pubkey}`)
        
        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const resourcePayload = {
            id: newWorkshopId,
            userId: userResponse.data.id,
            price: payload.price || 0,
            noteId: nAddress,
        }
        const response = await axios.post(`/api/resources`, resourcePayload);
        
        if (response.status !== 201) {
            showToast('error', 'Error', 'Failed to create resource. Please try again.');
            return;
        }

        const publishResponse = await publishAll(signedEvent);

        if (!publishResponse) {
            showToast('error', 'Error', 'Failed to publish resource. Please try again.');
            return;
        } else if (publishResponse?.failedRelays) {
            publishResponse?.failedRelays.map(relay => {
                showToast('warn', 'Warning', `Failed to publish to relay: ${relay}`);
            });
        }

        publishResponse?.successfulRelays.map(relay => {
            showToast('success', 'Success', `Published to relay: ${relay}`);
        })
    }

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
                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                {checked && (
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
