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


// todo dont allow adding courses as resources
// todo need to update how I handle unpubbed resources
// todo add back topics
const CourseForm = ({ draft = null, isPublished = false }) => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [isPaidCourse, setIsPaidCourse] = useState(draft?.price ? true : false);
    const [price, setPrice] = useState(draft?.price || 0);
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
        console.log('selectedLessons:', selectedLessons);
    }, [selectedLessons]);

    useEffect(() => {
        const fetchLessons = async () => {
            if (draft && draft?.resources) {
                const parsedLessons = await Promise.all(
                    draft.resources.map(async (lesson) => {
                        const parsedLesson = await fetchLessonEventFromNostr(lesson.noteId);
                        return parsedLesson;
                    })
                );
                setSelectedLessons([...selectedLessons, ...parsedLessons]);
                setLoadingLessons(false); // Data is loaded
            } else {
                setLoadingLessons(false); // No draft means no lessons to load
            }
        };

        fetchLessons();
    }, [draft]); // Only depend on draft

    const fetchLessonEventFromNostr = async (eventId) => {
        try {
            await ndk.connect();
            const fetchedEvent = await ndk.fetchEvent(eventId);
            if (fetchedEvent) {
                return parseEvent(fetchedEvent);
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
            setIsPaidCourse(draft.price > 0);
            setPrice(draft.price || 0);
            setCoverImage(draft.image);
            // setSelectedLessons(draft.resources || []);
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
            // Step 1: Create the course draft
            const courseDraftPayload = {
                userId: user.id, // Make sure this is set
                title,
                summary,
                image: coverImage,
                price: price || 0,
                topics,
            };

            const courseDraftResponse = await axios.post('/api/courses/drafts', courseDraftPayload);
            const courseDraftId = courseDraftResponse.data.id;

            // Step 2: Associate resources with the course draft
            for (const lesson of selectedLessons) {
                await axios.put(`/api/resources/${lesson.d}`, {
                    courseDraftId: courseDraftId
                });
            }

            showToast('success', 'Success', 'Course draft saved successfully');
            router.push(`/course/${courseDraftId}/draft`);
        } catch (error) {
            console.error('Error saving course draft:', error);
            showToast('error', 'Failed to save course draft', error.response?.data?.details || error.message);
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

        const filterContent = (content) => {
            console.log('contentttttt', content);
            // If there is price in content.tags, then it is a paid content 'price' in the 0 index and stringified int in the 1 index
            const contentPrice = content.tags.find(tag => tag[0] === 'price') ? parseInt(content.tags.find(tag => tag[0] === 'price')[1]) : 0;
            return isPaidCourse ? contentPrice > 0 : contentPrice === 0;
        };

        const draftOptions = drafts.filter(filterContent).map(draft => ({
            label: <ContentDropdownItem content={draft} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === draft.id} />,
            value: draft.id
        }));

        const resourceOptions = resources.filter(filterContent).map(resource => {
            const { id, kind, pubkey, content, title, summary, image, published_at, d, topics } = parseEvent(resource);
            return {
                label: <ContentDropdownItem content={{ id, kind, pubkey, content, title, summary, image, published_at, d, topics }} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === id} />,
                value: id
            };
        });

        const workshopOptions = workshops.filter(filterContent).map(workshop => {
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
                    {selectedLessons.map((lesson, index) => {
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
                <Button type="submit" label="Create Draft" className="p-button-raised p-button-success" />
            </div>
        </form>
    );
}

export default CourseForm;