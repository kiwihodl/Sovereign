import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorageWithEffect } from "@/hooks/useLocalStorage";
import { useNostr } from "@/hooks/useNostr";
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
    const { fetchResources, fetchWorkshops } = useNostr();
    const [pubkey, setPubkey] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const createdAt = Math.floor(Date.now() / 1000); // UNIX timestamp
        const eventKind = 30050; // Custom kind for a course list

        // Publish unpublished drafts as NIP-23 events
        const publishedLessons = await Promise.all(
            lessons.map(async (lesson) => {
                console.log('lesson:', lesson);
                if (lesson.type === 'draft') {
                    const draftEvent = {
                        kind: 30023,
                        created_at: createdAt,
                        content: lesson.content,
                        tags: [
                            ["d", lesson.id],
                            ["title", lesson.title],
                            // Add other metadata tags as needed
                        ],
                        pubkey: pubkey,
                    };
                    console.log('draftEvent:', draftEvent);
                    return draftEvent;
                }
            }));

        const tags = [
            ["title", title],
            ["summary", summary],
            ["price", checked ? price.toString() : "free"],
            ["image", coverImage],
            ...publishedLessons.map(lesson => ["a", `30023:${lesson.id}:${lesson.id}`]),
            ...topics.map(topic => ["topic", topic.trim().toLowerCase()])
        ];

        const content = JSON.stringify({ description: "Course content details" }); // Placeholder content

        const courseEvent = {
            kind: eventKind,
            created_at: createdAt,
            content: content,
            tags: tags,
            pubkey: pubkey,
        };

        console.log('courseEvent:', courseEvent);
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
        const draftOptions = drafts.map(draft => ({
            label: <ContentDropdownItem content={draft} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === draft.id} />,
            value: draft.id
        }));

        const resourceOptions = resources.map(resource => {
            const { id, title, summary, image, published_at } = parseEvent(resource);
            return {
                label: <ContentDropdownItem content={{ id, title, summary, image, published_at }} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === id} />,
                value: id
            };
        });

        const workshopOptions = workshops.map(workshop => {
            const { id, title, summary, image, published_at } = parseEvent(workshop);
            return {
                label: <ContentDropdownItem content={{ id, title, summary, image, published_at }} onSelect={(content) => handleLessonSelect(content, index)} selected={lessons[index] && lessons[index].id === id} />,
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
            <div className="p-inputgroup flex-1 mt-8">
                <InputText value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
            </div>
            <div className="p-inputgroup flex-1 mt-8">
                <InputText value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover Image URL" />
            </div>
            <div className="p-inputgroup flex-1 mt-8 flex-col">
                <p className="py-2">Paid Course</p>
                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                {checked && (
                    <div className="p-inputgroup flex-1 py-4">
                        <InputNumber value={price} onValueChange={(e) => setPrice(e.value)} placeholder="Price (sats)" />
                    </div>
                )}
            </div>
            <div className="mt-8 flex-col w-full">
                <div className="mt-8 flex-col w-full">
                    {selectedLessons.map((lesson, index) => (
                        <div key={lesson.id} className="p-inputgroup flex-1 mt-8">
                            <ContentDropdownItem content={lesson} selected={true} />
                            <Button icon="pi pi-times" className="p-button-danger" onClick={() => removeLesson(index)} />
                        </div>
                    ))}
                    {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="p-inputgroup flex-1 mt-8">
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
            <div className="mt-8 flex-col w-full">
                {topics.map((topic, index) => (
                    <div key={index} className="p-inputgroup flex-1 mt-8">
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
