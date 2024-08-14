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
import 'primeicons/primeicons.css';

const CourseForm = ({ draft = null, isPublished = false }) => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [checked, setChecked] = useState(false);
    const [price, setPrice] = useState(0);
    const [coverImage, setCoverImage] = useState('');
    const [lessons, setLessons] = useState([{ id: uuidv4(), title: 'Select a lesson' }]);
    const [loadingLessons, setLoadingLessons] = useState(true);
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
        const fetchLessons = async () => {
            if (draft && draft.resources) {
                const parsedLessons = await Promise.all(
                    draft.resources.map(async (lesson) => {
                        const parsedLesson = await fetchLessonEventFromNostr(lesson.noteId);
                        return parsedLesson;
                    })
                );
                setLessons(parsedLessons);
                setLoadingLessons(false); // Data is loaded
            } else {
                setLoadingLessons(false); // No draft means no lessons to load
            }
        };

        fetchLessons();
    }, [draft]);

    const fetchLessonEventFromNostr = async (eventId) => {
        try {
            await ndk.connect();

            const fetchedEvent = await ndk.fetchEvent(eventId);

            if (fetchedEvent) {
                const parsedEvent = parseEvent(fetchedEvent);
                return parsedEvent;
            }
        } catch (error) {
            showToast('error', 'Error', `Failed to fetch lesson: ${eventId}`);
        }
    }

    useEffect(() => {
        if (draft) {
            console.log('draft:', draft);
            setTitle(draft.title);
            setSummary(draft.summary);
            setChecked(draft.price > 0);
            setPrice(draft.price || 0);
            setCoverImage(draft.image);
            setSelectedLessons(draft.resources || []);
            setTopics(draft.topics || ['']);
        }
    }, [draft]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ndk.signer) {
            await addSigner();
        }

        // Prepare the lessons from selected lessons
        const resources = await Promise.all(selectedLessons.map(async (lesson) => {
            if (lesson?.type) {
                const event = createLessonEvent(lesson);
                const published = await event.publish();

                if (!published) {
                    throw new Error(`Failed to publish lesson: ${lesson.title}`);
                }

                const resource = await axios.post('/api/resources', {
                    id: event.tags.find(tag => tag[0] === 'd')[1],
                    userId: user.id,
                    price: lesson.price || 0,
                    noteId: event.id,
                });

                if (resource.status !== 201) {
                    throw new Error(`Failed to post resource: ${lesson.title}`);
                }

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

        const payload = {
            userId: user.id,
            title,
            summary,
            image: coverImage,
            price: price || 0,
            resources,
            topics,
        };

        try {
            let response;
            if (draft) {
                response = await axios.put(`/api/courses/drafts/${draft.id}`, payload);
                showToast('success', 'Success', 'Course draft updated successfully');
            } else {
                response = await axios.post('/api/courses/drafts', payload);
                showToast('success', 'Success', 'Course draft saved successfully');
            }
            router.push(`/course/${response.data.id}/draft`);
        } catch (error) {
            console.error('Error saving course draft:', error);
            showToast('error', 'Failed to save course draft. Please try again.');
        }
    };

    const handlePublishedCourse = async (e) => {
        e.preventDefault();

        if (!ndk.signer) {
            await addSigner();
        }

        const event = new NDKEvent(ndk);
        event.kind = price > 0 ? 30402 : 30023;
        event.content = JSON.stringify({
            title,
            summary,
            image: coverImage,
            resources: selectedLessons.map(lesson => lesson.id),
        });
        event.tags = [
            ['d', draft.id],
            ['title', title],
            ['summary', summary],
            ['image', coverImage],
            ...topics.map(topic => ['t', topic]),
            ['published_at', Math.floor(Date.now() / 1000).toString()],
            ['price', price.toString()],
        ];

        try {
            const published = await ndk.publish(event);

            if (published) {
                const response = await axios.put(`/api/courses/${draft.id}`, { noteId: event.id });
                showToast('success', 'Success', 'Course published successfully');
                router.push(`/course/${event.id}`);
            } else {
                showToast('error', 'Error', 'Failed to publish course. Please try again.');
            }
        } catch (error) {
            console.error('Error publishing course:', error);
            showToast('error', 'Failed to publish course. Please try again.');
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
    if (loadingLessons || resourcesLoading || workshopsLoading || draftsLoading) {
        return <ProgressSpinner />;
    }

    return (
        <form onSubmit={isPublished ? handlePublishedCourse : handleSubmit}>
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
                    {selectedLessons.map(async (lesson, index) => {
                        return (
                        <div key={lesson.id} className="p-inputgroup flex-1 mt-4">
                            <ContentDropdownItem content={lesson} selected={true} />
                            <Button icon="pi pi-times" className="p-button-danger" onClick={() => removeLesson(index)} />
                        </div>
                    )
                })
                    }
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
                <Button type="submit" label={draft ? (isPublished ? "Publish" : "Update") : "Submit"} className="p-button-raised p-button-success" />
            </div>
        </form>
    );
}

export default CourseForm;