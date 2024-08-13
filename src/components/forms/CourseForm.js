import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { v4 as uuidv4, v4 } from 'uuid';
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
import 'primeicons/primeicons.css';

const CourseForm = () => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [checked, setChecked] = useState(false);
    const [price, setPrice] = useState(0);
    const [coverImage, setCoverImage] = useState('');
    const [lessons, setLessons] = useState([{ id: uuidv4(), title: 'Select a lesson' }]);
    const [selectedLessons, setSelectedLessons] = useState([]);
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
        console.log('selectedLessons:', selectedLessons);
    }, [selectedLessons]);

    const handleDraftSubmit = async (e) => {
        e.preventDefault();

        if (!ndk.signer) {
            await addSigner();
        }

        // Prepare the lessons from selected lessons
        const resources = await Promise.all(selectedLessons.map(async (lesson) => {
            // if .type is present than this lesson is a draft we need to publish
            if (lesson?.type) {
                const event = createLessonEvent(lesson);
                const published = await event.publish();

                if (!published) {
                    throw new Error(`Failed to publish lesson: ${lesson.title}`);
                }

                // Now post to resources
                const resource = await axios.post('/api/resources', {
                    id: event.tags.find(tag => tag[0] === 'd')[1],
                    userId: user.id,
                    price: lesson.price || 0,
                    noteId: event.id,
                });

                if (resource.status !== 201) {
                    throw new Error(`Failed to post resource: ${lesson.title}`);
                }

                // now delete the draft
                const deleted = await axios.delete(`/api/drafts/${lesson.id}`);

                if (deleted.status !== 204) {
                    throw new Error(`Failed to delete draft: ${lesson.title}`);
                }

                return {
                    id: lesson.id,
                    userId: user.id,
                    price: lesson.price || 0,
                    noteId: event.id,
                }
            } else {
                return {
                    id: lesson.d,
                    userId: user.id,
                    price: lesson.price || 0,
                    noteId: lesson.id,
                }
            }
        }));

        console.log('resources:', resources);

        const payload = {
            userId: user.id,
            title,
            summary,
            image: coverImage,
            price: price || 0,
            resources, // Send the array of lesson/resource IDs
        };

        console.log('payload:', payload);

        try {
            // Post the course draft to the API
            const response = await axios.post('/api/courses/drafts', payload);

            console.log('response:', response);

            // If successful, navigate to the course page
            showToast('success', 'Course draft saved successfully');
            router.push(`/course/${response.data.id}/draft`);
        } catch (error) {
            console.error('Error saving course draft:', error);
            showToast('error', 'Failed to save course draft. Please try again.');
        }
    };

    const createLessonEvent = (lesson) => {
        const event = new NDKEvent(ndk);
        event.kind = lesson.price ? 30402 : 30023;
        event.content = lesson.content;
        event.tags = [
            ['d', lesson.id],
            ['title', lesson.title],
            ['summary', lesson.summary],
            ['image', lesson.image],
            ...lesson.topics.map(topic => ['t', topic]),
            ['published_at', Math.floor(Date.now() / 1000).toString()],
        ];
        return event;
    };

    const handleLessonChange = (e, index) => {
        const selectedLessonId = e.value;
        const selectedLesson = getContentOptions(index).flatMap(group => group.items).find(lesson => lesson.value === selectedLessonId);

        const updatedLessons = lessons.map((lesson, i) =>
            i === index ? { ...lesson, id: selectedLessonId, title: selectedLesson.label.props.content.title } : lesson
        );
        setLessons(updatedLessons);
    };

    const handleLessonSelect = (content) => {
        setSelectedLessons([...selectedLessons, content]);
        addLesson();
    };

    const addLesson = () => {
        setLessons([...lessons, { id: uuidv4(), title: 'Select a lesson' }]);
    };

    const removeLesson = (index) => {
        const updatedLessons = lessons.filter((_, i) => i !== index);
        const updatedSelectedLessons = selectedLessons.filter((_, i) => i !== index);

        if (updatedLessons.length === 0) {
            updatedLessons.push({ id: uuidv4(), title: 'Select a lesson' });
        }

        setLessons(updatedLessons);
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

    const getContentOptions = (index) => {
        if (resourcesLoading || !resources || workshopsLoading || !workshops || draftsLoading || !drafts) {
            return [];
        }
        const draftOptions = drafts.map(draft => ({
            label: <ContentDropdownItem content={draft} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === draft.id} />,
            value: draft.id
        }));

        const resourceOptions = resources.map(resource => {
            const { id, kind, pubkey, content, title, summary, image, published_at, d, topics } = parseEvent(resource);
            return {
                label: <ContentDropdownItem content={{ id, kind, pubkey, content, title, summary, image, published_at, d, topics }} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === id} />,
                value: id
            };
        });

        const workshopOptions = workshops.map(workshop => {
            const { id, kind, pubkey, content, title, summary, image, published_at, d, topics } = parseEvent(workshop);
            return {
                label: <ContentDropdownItem content={{ id, kind, pubkey, content, title, summary, image, published_at, d, topics }} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === id} />,
                value: id
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

    // const lessonOptions = getContentOptions();
    if (resourcesLoading || workshopsLoading || draftsLoading) {
        return <ProgressSpinner />;
    }

    return (
        <form onSubmit={handleDraftSubmit}>
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
                        <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>
            <div className="mt-8 flex-col w-full">
                <div className="mt-4 flex-col w-full">
                    {selectedLessons.map((lesson, index) => (
                        <div key={lesson.id} className="p-inputgroup flex-1 mt-4">
                            <ContentDropdownItem content={lesson} selected={true} />
                            <Button icon="pi pi-times" className="p-button-danger" onClick={() => removeLesson(index)} />
                        </div>
                    ))}
                    {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="p-inputgroup flex-1 mt-4">
                            <Dropdown
                                value={lesson.title}
                                options={getContentOptions(index)}
                                onChange={(e) => handleLessonChange(e, index)}
                                placeholder="Select a Lesson"
                                itemTemplate={(option) => option.label}
                                optionLabel="label"
                                optionGroupLabel="label"
                                optionGroupChildren="items"
                            />
                        </div>
                    ))}
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
                <Button type="submit" label="Submit" className="p-button-raised p-button-success" />
            </div>
        </form>
    );
}

export default CourseForm;