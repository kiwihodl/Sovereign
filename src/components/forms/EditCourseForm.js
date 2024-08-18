import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { useNDKContext } from "@/context/NDKContext";
import { useWorkshopsQuery } from "@/hooks/nostrQueries/content/useWorkshopsQuery";
import { useResourcesQuery } from "@/hooks/nostrQueries/content/useResourcesQuery";
import { useDraftsQuery } from "@/hooks/apiQueries/useDraftsQuery";
import { parseEvent } from "@/utils/nostr";
import ContentDropdownItem from "@/components/content/dropdowns/ContentDropdownItem";
import 'primeicons/primeicons.css';

// todo dealing with adding drafts as new lessons
// todo disable ability to add a free lesson to a paid course and vice versa (or just make the user remove the lesson if they want to change the price)
// todo deal with error where 2 new lessons popup when only one is added from the dropdown
// todo on edit lessons need to make sure that the user is still choosing the order those lessons appear in the course
const EditCourseForm = ({ draft }) => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [checked, setChecked] = useState(false);
    const [price, setPrice] = useState(0);
    const [isPaid, setIsPaid] = useState(false);
    const [coverImage, setCoverImage] = useState('');
    const [selectedLessons, setSelectedLessons] = useState([]);
    const [selectedLessonsLoading, setSelectedLessonsLoading] = useState(false);
    const [topics, setTopics] = useState(['']);

    const { ndk } = useNDKContext();
    const { resources, resourcesLoading } = useResourcesQuery();
    const { workshops, workshopsLoading } = useWorkshopsQuery();
    const { drafts, draftsLoading } = useDraftsQuery();
    const { data: session } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (draft) {
            const fetchLessonEventFromNostr = async (eventId) => {
                try {
                    await ndk.connect();
                    const fetchedEvent = await ndk.fetchEvent(eventId);
                    return fetchedEvent ? parseEvent(fetchedEvent) : null;
                } catch (error) {
                    showToast('error', 'Error', `Failed to fetch lesson: ${eventId}`);
                    return null;
                }
            };

            const fetchLessons = async () => {
                const fetchedLessons = await Promise.all(
                    draft.resources.map(lesson => fetchLessonEventFromNostr(lesson.noteId))
                );
                setSelectedLessons(fetchedLessons.filter(Boolean));
            };

            fetchLessons();
            setTitle(draft.title);
            setSummary(draft.summary);
            setChecked(draft.price > 0);
            setPrice(draft.price || 0);
            setIsPaid(draft.price > 0);
            setCoverImage(draft.image);
            setTopics(draft.topics || ['']);
        }
    }, [draft, ndk, showToast, parseEvent]);

    const handlePriceChange = (value) => {
        setPrice(value);
        setIsPaid(value > 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Ensure selectedLessons is an array
            const lessonsToUpdate = Array.isArray(selectedLessons) ? selectedLessons : [];

            // Update newly added lessons with courseDraftId
            const updatePromises = lessonsToUpdate
                .filter(lesson => lesson && lesson.id && !draft.resources.some(r => r.id === lesson.id))
                .map(lesson => 
                    axios.put(`/api/resources/${lesson.d}`, { courseDraftId: draft.id })
                );
            
            await Promise.all(updatePromises);

            // Prepare payload for course draft update
            const payload = {
                id: draft.id, // Include the id in the payload
                title,
                summary,
                image: coverImage,
                price: isPaid ? price : 0,
                topics,
                resourceIds: lessonsToUpdate.filter(lesson => lesson && lesson.id).map(lesson => lesson.id)
            };        

            // Update course draft
            const response = await axios.put(`/api/courses/drafts/${draft.id}`, payload);
            console.log('Update response:', response.data);

            showToast('success', 'Success', 'Course draft updated successfully');
            router.push(`/course/${draft.id}/draft`);
        } catch (error) {
            console.error('Error updating course draft:', error);
            showToast('error', 'Failed to update course draft', error.response?.data?.details || error.message);
        }
    };

    const handleLessonSelect = (content) => {
        if (!selectedLessons.some(lesson => lesson.id === content.id)) {
            setSelectedLessons(prevLessons => [...prevLessons, content]);
        }
    };

    const removeLesson = (index) => {
        const updatedSelectedLessons = selectedLessons.filter((_, i) => i !== index);
        setSelectedLessons(updatedSelectedLessons);
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
            const contentPrice = content.price || 0;
            return isPaid ? contentPrice > 0 : contentPrice === 0;
        };

        const resourceOptions = resources.filter(filterContent).map(resource => {
            const parsedResource = parseEvent(resource);
            return {
                label: <ContentDropdownItem content={parsedResource} onSelect={handleLessonSelect} selected={selectedLessons.some(lesson => lesson.id === parsedResource.id)} />,
                value: parsedResource
            };
        });

        const workshopOptions = workshops.filter(filterContent).map(workshop => {
            const parsedWorkshop = parseEvent(workshop);
            return {
                label: <ContentDropdownItem content={parsedWorkshop} onSelect={handleLessonSelect} selected={selectedLessons.some(lesson => lesson.id === parsedWorkshop.id)} />,
                value: parsedWorkshop
            };
        });

        return [
            { label: 'Resources', items: resourceOptions },
            { label: 'Workshops', items: workshopOptions }
        ];
    };

    if (resourcesLoading || workshopsLoading || draftsLoading || selectedLessonsLoading) {
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
            <div className="p-inputgroup flex-1 mt-4 flex-col">
                <p className="py-2">Paid Course</p>
                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                {checked && (
                    <div className="p-inputgroup flex-1 py-4">
                        <InputNumber value={price} onValueChange={(e) => handlePriceChange(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>
            <div className="mt-8 flex-col w-full">
                <div className="mt-4 flex-col w-full">
                    {selectedLessons.map((lesson, index) => (
                        <div key={index} className="p-inputgroup flex-1 mt-4">
                            <ContentDropdownItem content={lesson} selected={true} />
                            <Button icon="pi pi-times" className="p-button-danger" onClick={() => removeLesson(index)} />
                        </div>
                    ))}
                    <div className="p-inputgroup flex-1 mt-4">
                        <Dropdown
                            options={getContentOptions()}
                            onChange={(e) => handleLessonSelect(e.value)}
                            placeholder="Add a Lesson"
                            optionLabel="label"
                            optionGroupLabel="label"
                            optionGroupChildren="items"
                            value={null}
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
                <Button type="submit" label="Update Draft" className="p-button-raised p-button-success" />
            </div>
        </form>
    );
}

export default EditCourseForm;