import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { v4 as uuidv4, v4 } from 'uuid';
import { useLocalStorageWithEffect } from "@/hooks/useLocalStorage";
import { useNostr } from "@/hooks/useNostr";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { nip19 } from "nostr-tools"
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
    const [user, setUser] = useLocalStorageWithEffect('user', {});
    const [drafts, setDrafts] = useState([]);
    const [resources, setResources] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const { fetchResources, fetchWorkshops, publish, fetchSingleEvent } = useNostr();
    const [pubkey, setPubkey] = useState('');

    const router = useRouter();
    const { showToast } = useToast();

    const fetchAllContent = async () => {
        try {
            // Fetch drafts from the database
            const draftsResponse = await axios.get(`/api/drafts/all/${user.id}`);
            const drafts = draftsResponse.data;

            // Fetch resources and workshops from Nostr
            const resources = await fetchResources();
            const workshops = await fetchWorkshops();

            if (drafts.length > 0) {
                setDrafts(drafts);
            }
            if (resources.length > 0) {
                console.log('resources:', resources);
                setResources(resources);
            }
            if (workshops.length > 0) {
                setWorkshops(workshops);
            }
        } catch (err) {
            console.error(err);
            // Handle error
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchAllContent();
        }
    }, [user]);

    /**
 * Course Creation Flow:
 * 1. Generate a new course ID
 * 2. Process each lesson:
 *    - If unpublished: create event, publish to Nostr, save to DB, delete draft
 *    - If published: use existing data
 * 3. Create and publish course event to Nostr
 * 4. Save course to database
 * 5. Show success message and redirect to course page
 */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newCourseId = uuidv4();
        const processedLessons = [];

        try {
            // Step 1: Process lessons
            console.log('selectedLessons:', selectedLessons);
            for (const lesson of selectedLessons) {
                let noteId = lesson.noteId;

                if (!lesson.published_at) {
                    // Publish unpublished lesson
                    const event = createLessonEvent(lesson);
                    const signedEvent = await window.nostr.signEvent(event);
                    const published = await publish(signedEvent);

                    if (!published) {
                        throw new Error(`Failed to publish lesson: ${lesson.title}`);
                    }

                    noteId = signedEvent.id;

                    // Save to db and delete draft
                    await Promise.all([
                        axios.post('/api/resources', {
                            id: lesson.id,
                            noteId: noteId,
                            userId: user.id,
                            price: lesson.price || 0,
                        }),
                        axios.delete(`/api/drafts/${lesson.id}`)
                    ]);
                }

                processedLessons.push({ id: lesson?.d });
            }

            // Step 2: Create and publish course
            const courseEvent = createCourseEvent(newCourseId, title, summary, coverImage, selectedLessons);
            const signedCourseEvent = await window.nostr.signEvent(courseEvent);
            const published = await publish(signedCourseEvent);

            if (!published) {
                throw new Error('Failed to publish course');
            }

            // Step 3: Save course to db
            console.log('processedLessons:', processedLessons);
            await axios.post('/api/courses', {
                id: newCourseId,
                resources: {
                    connect: processedLessons.map(lesson => ({ id: lesson?.id }))
                },
                noteId: signedCourseEvent.id,
                user: {
                    connect: { id: user.id }
                },
                price: price || 0
            });

            // Step 4: Show success message and redirect
            showToast('success', 'Course created successfully');
            router.push(`/course/${signedCourseEvent.id}`);

        } catch (error) {
            console.error('Error creating course:', error);
            showToast('error', error.message || 'Failed to create course. Please try again.');
        }
    };

    const createLessonEvent = (lesson) => ({
        kind: lesson.price ? 30402 : 30023,
        content: lesson.content,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['d', lesson.id],
            ['title', lesson.title],
            ['summary', lesson.summary],
            ['image', lesson.image],
            ...lesson.topics.map(topic => ['t', topic]),
            ['published_at', Math.floor(Date.now() / 1000).toString()],
            ...(lesson.price ? [
                ['price', lesson.price],
                ['location', `https://plebdevs.com/${lesson.topics[1]}/${lesson.id}`]
            ] : [])
        ]
    });

    const createCourseEvent = (courseId, title, summary, coverImage, lessons) => ({
        kind: 30004,
        created_at: Math.floor(Date.now() / 1000),
        content: "",
        tags: [
            ['d', courseId],
            ['name', title],
            ['picture', coverImage],
            ['image', coverImage],
            ['description', summary],
            ['l', "Education"],
            ...lessons.map((lesson) => ['a', `${lesson.kind}:${lesson.pubkey}:${lesson.d}`]),
        ],
    });

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

    const lessonOptions = getContentOptions();

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