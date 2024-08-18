import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { useNDKContext } from "@/context/NDKContext";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { useWorkshopsQuery } from "@/hooks/nostrQueries/content/useWorkshopsQuery";
import { useResourcesQuery } from "@/hooks/nostrQueries/content/useResourcesQuery";
import { useDraftsQuery } from "@/hooks/apiQueries/useDraftsQuery";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { parseEvent } from "@/utils/nostr";
import ContentDropdownItem from "@/components/content/dropdowns/ContentDropdownItem";
import SelectedContentItem from "@/components/content/SelectedContentItem";
import 'primeicons/primeicons.css';


// todo dont allow adding courses as resources
// todo need to update how I handle unpubbed resources
// todo add back topics
const CourseForm = ({ draft = null, isPublished = false }) => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [isPaidCourse, setIsPaidCourse] = useState(draft?.price ? true : false);
    const [price, setPrice] = useState(draft?.price || 0);
    const [coverImage, setCoverImage] = useState('');
    const [selectedContent, setSelectedContent] = useState([]);
    const [topics, setTopics] = useState(['']);

    const { resources, resourcesLoading, resourcesError } = useResourcesQuery();
    const { workshops, workshopsLoading, workshopsError } = useWorkshopsQuery();
    const { drafts, draftsLoading, draftsError } = useDraftsQuery();
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const { ndk, addSigner } = useNDKContext();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    useEffect(() => {
        if (draft) {
            console.log('draft:', draft);
            setTitle(draft.title);
            setSummary(draft.summary);
            setIsPaidCourse(draft.price > 0);
            setPrice(draft.price || 0);
            setCoverImage(draft.image);
            setSelectedContent(draft.resources.concat(draft.drafts) || []);
            setTopics(draft.topics || ['']);
        }
    }, [draft]);

    const handlePriceChange = (value) => {
        setPrice(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            showToast('error', 'Error', 'User not authenticated');
            return;
        }

        try {
            const courseDraftPayload = {
                userId: user.id,
                title,
                summary,
                image: coverImage,
                price: price || 0,
                topics,
                resources: selectedContent.filter(content => content.kind === 30023 || content.kind === 30402).map(resource => resource.d),
                drafts: selectedContent.filter(content => !content.kind).map(draft => draft.id),
            };

            const courseDraftResponse = await axios.post('/api/courses/drafts', courseDraftPayload);
            const courseDraftId = courseDraftResponse.data.id;

            showToast('success', 'Success', 'Course draft saved successfully');
            router.push(`/course/${courseDraftId}/draft`);
        } catch (error) {
            console.error('Error saving course draft:', error);
            showToast('error', 'Failed to save course draft', error.response?.data?.details || error.message);
        }
    };

    const handleContentSelect = (content) => {
        if (!selectedContent.some(item => item.id === content.id)) {
            setSelectedContent([...selectedContent, content]);
        }
    };

    const removeContent = (index) => {
        const updatedContent = selectedContent.filter((_, i) => i !== index);
        setSelectedContent(updatedContent);
    };

    const addTopic = () => {
        setTopics([...topics, '']);
    };

    const removeTopic = (index) => {
        const updatedTopics = topics.filter((_, i) => i !== index);
        setTopics(updatedTopics);
    };

    const handleTopicChange = (index, value) => {
        const updatedTopics = topics.map((topic, i) => i === index ? value : topic);
        setTopics(updatedTopics);
    };

    const getContentOptions = () => {
        if (resourcesLoading || !resources || workshopsLoading || !workshops || draftsLoading || !drafts) {
            return [];
        }

        const filterContent = (content) => {
            const contentPrice = content.tags ? (content.tags.find(tag => tag[0] === 'price') ? parseInt(content.tags.find(tag => tag[0] === 'price')[1]) : 0) : (content.price || 0);
            return isPaidCourse ? contentPrice > 0 : contentPrice === 0;
        };

        const draftOptions = drafts.filter(filterContent).map(draft => ({
            label: draft.title,
            value: draft
        }));

        const resourceOptions = resources.filter(filterContent).map(resource => {
            const parsedResource = parseEvent(resource);
            return {
                label: parsedResource.title,
                value: parsedResource
            };
        });

        const workshopOptions = workshops.filter(filterContent).map(workshop => {
            const parsedWorkshop = parseEvent(workshop);
            return {
                label: parsedWorkshop.title,
                value: parsedWorkshop
            };
        });

        return [
            {
                label: 'Drafts',
                items: draftOptions
            },
            {
                label: 'Resources',
                items: resourceOptions
            },
            {
                label: 'Workshops',
                items: workshopOptions
            }
        ];
    };

    if (resourcesLoading || workshopsLoading || draftsLoading) {
        return <ProgressSpinner />;
    }

    return (
        <form onSubmit={handleSubmit}>
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
                <p className="py-2">Paid Course</p>
                <InputSwitch checked={isPaidCourse} onChange={(e) => setIsPaidCourse(e.value)} />
                {isPaidCourse && (
                    <div className="p-inputgroup flex-1 py-4">
                        <InputNumber 
                            value={price} 
                            onValueChange={(e) => handlePriceChange(e.value)} 
                            placeholder="Price (sats)" 
                            min={1}
                        />
                    </div>
                )}
            </div>
            <div className="mt-8 flex-col w-full">
                <div className="mt-4 flex-col w-full">
                    {selectedContent.map((content, index) => (
                        <div key={content.id} className="flex mt-4">
                            <SelectedContentItem content={content} />
                            <Button 
                                icon="pi pi-times"
                                className="p-button-danger rounded-tl-none rounded-bl-none" 
                                onClick={() => removeContent(index)}
                            />
                        </div>
                    ))}
                    <div className="p-inputgroup flex-1 mt-4">
                        <Dropdown
                            options={getContentOptions()}
                            onChange={(e) => handleContentSelect(e.value)}
                            placeholder="Select Content"
                            itemTemplate={(option) => <ContentDropdownItem content={option.value} onSelect={handleContentSelect} />}
                            optionLabel="label"
                            optionGroupLabel="label"
                            optionGroupChildren="items"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4 flex-col w-full">
                {topics.map((topic, index) => (
                    <div key={index} className="p-inputgroup flex-1 mt-4">
                        <InputText value={topic} onChange={(e) => handleTopicChange(index, e.target.value)} placeholder={`Topic #${index + 1}`} className="w-full" />
                        {index > 0 && (
                            <Button icon="pi pi-times" className="p-button-danger mt-2" onClick={() => removeTopic(index)} />
                        )}
                    </div>
                ))}
                <Button type="button" icon="pi pi-plus" onClick={addTopic} className="p-button-outlined mt-2" />
            </div>
            <div className="flex justify-center mt-8">
                <Button type="submit" label="Create Draft" className="p-button-raised p-button-success" />
            </div>
        </form>
    );
}

export default CourseForm;