import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { nip04, verifyEvent, nip19 } from "nostr-tools";
import { useNostr } from "@/hooks/useNostr";
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorageWithEffect } from "@/hooks/useLocalStorage";
import EditorHeader from "./Editor/EditorHeader";
import { useToast } from "@/hooks/useToast";
import 'primeicons/primeicons.css';

const ResourceForm = () => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [checked, setChecked] = useState(false);
    const [price, setPrice] = useState(0);
    const [text, setText] = useState('');
    const [topics, setTopics] = useState(['']); // Initialize with an empty string to show one input by default

    const [user] = useLocalStorageWithEffect('user', {});

    const { showToast } = useToast();

    const { publishAll } = useNostr();

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the default form submission mechanism
        const payload = {
            title,
            summary,
            isPaidResource: checked,
            price: checked ? price : null,
            content: text,
            topics: topics.map(topic => topic.trim().toLowerCase()) // Process topics as they are
        };

        if (checked) {
            broadcastPaidResource(payload);
        } else {
            broadcastFreeResource(payload);
        }
    };

    const broadcastFreeResource = async (payload) => {
        const newresourceId = uuidv4();
        const event = {
            kind: 30023,
            content: payload.content,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ['d', newresourceId],
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
            identifier: newresourceId,
        })

        console.log('nAddress:', nAddress);

        const userResponse = await axios.get(`/api/users/${user.pubkey}`)

        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const resourcePayload = {
            id: newresourceId,
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
    const broadcastPaidResource = async (payload) => {
        // encrypt the content with NEXT_PUBLIC_APP_PRIV_KEY to NEXT_PUBLIC_APP_PUBLIC_KEY
        const encryptedContent = await nip04.encrypt(process.env.NEXT_PUBLIC_APP_PRIV_KEY ,process.env.NEXT_PUBLIC_APP_PUBLIC_KEY, payload.content);
        const newresourceId = uuidv4();
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
                ['location', `https://plebdevs.com/resource/${newresourceId}`],
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
            identifier: newresourceId,
        })

        console.log('nAddress:', nAddress);

        const userResponse = await axios.get(`/api/users/${user.pubkey}`)
        
        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const resourcePayload = {
            id: newresourceId,
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

    // Define custom toolbar for the editor
    const customToolbar = (
        <div id="toolbar">
            {/* Include existing toolbar items */}
            <span className="ql-formats">
                <select className="ql-header" defaultValue="">
                    <option value="1">Heading</option>
                    <option value="2">Subheading</option>
                    <option value="">Normal</option>
                </select>
            </span>
            <span className="ql-formats">
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                <button className="ql-underline"></button>
            </span>
            <span className="ql-formats">
                <button className="ql-list" value="ordered"></button>
                <button className="ql-list" value="bullet"></button>
                <button className="ql-indent" value="-1"></button>
                <button className="ql-indent" value="+1"></button>
            </span>
            <span className="ql-formats">
                <button className="ql-link"></button>
                <button className="ql-image"></button>
                <button className="ql-video"></button> {/* This is your custom video button */}
            </span>
            <span className="ql-formats">
                <button className="ql-clean"></button>
            </span>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-inputgroup flex-1">
                <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <div className="p-inputgroup flex-1 mt-8">
                <InputText value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
            </div>

            <div className="p-inputgroup flex-1 mt-8 flex-col">
                <p className="py-2">Paid Resource</p>
                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                {checked && (
                    <div className="p-inputgroup flex-1 py-4">
                        <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>
            <div className="p-inputgroup flex-1 flex-col mt-8">
                <span>Content</span>
                <Editor
                    value={text}
                    onTextChange={(e) => setText(e.htmlValue)}
                    style={{ height: '320px' }}
                    headerTemplate={<EditorHeader quill={null} />}
                />
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
                <Button type="submit" label="Submit" className="p-button-success" />
            </div>
        </form>
    );
}

export default ResourceForm;
