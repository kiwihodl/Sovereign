import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import GenericButton from '@/components/buttons/GenericButton';
import LessonSelector from '@/components/forms/course/LessonSelector';
import { parseEvent } from '@/utils/nostr';
import { useRouter } from 'next/router';
import { useNDKContext } from '@/context/NDKContext';
import { useDraftsQuery } from '@/hooks/apiQueries/useDraftsQuery';
import { useDocuments } from '@/hooks/nostr/useDocuments';
import { useVideos } from '@/hooks/nostr/useVideos';
import { useToast } from '@/hooks/useToast';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import axios from 'axios';
import dynamic from 'next/dynamic';

const PublishedCourseForm = ({ course }) => {
    const [title, setTitle] = useState(course?.name || '');
    const [summary, setSummary] = useState(course?.description || '');
    const [content, setContent] = useState(course?.content || '');
    const [isPaidCourse, setIsPaidCourse] = useState(course?.price && course?.price > 0 ? true : false);
    const [price, setPrice] = useState(course?.price || 0);
    const [coverImage, setCoverImage] = useState(course?.image || '');
    const [topics, setTopics] = useState(course?.topics || ['']);
    const [lessons, setLessons] = useState([]);
    const [lessonIds, setLessonIds] = useState([]);
    const [allContent, setAllContent] = useState([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { ndk, addSigner } = useNDKContext();
    const { showToast } = useToast();
    const { documents, documentsLoading, documentsError } = useDocuments();
    const { videos, videosLoading, videosError } = useVideos();
    const { drafts, draftsLoading, draftsError } = useDraftsQuery();

    useEffect(() => {
        if (!documentsLoading && !videosLoading && !draftsLoading) {
            let combinedContent = [];
            if (documents) {
                combinedContent = [...combinedContent, ...documents];
            }
            if (videos) {
                combinedContent = [...combinedContent, ...videos];
            }
            if (drafts) {
                combinedContent = [...combinedContent, ...drafts];
            }
            setAllContent(combinedContent);
        }
    }, [documents, videos, drafts, documentsLoading, videosLoading, draftsLoading]);

    useEffect(() => {
        if (course) {
            const aTags = course.tags.filter(tag => tag[0] === 'a');
            setLessonIds(aTags.map(tag => tag[1].split(':')[2]));
        }
    }, [course]);

    useEffect(() => {
        if (lessonIds.length > 0 && allContent.length > 0) {
            // get all dtags from allContent
            const dTags = allContent.map(content => content?.tags?.find(tag => tag[0] === 'd')?.[1]);
            // filter lessonIds to only include dTags and grab those full objects from allContent and parse them
            const lessons = lessonIds.filter(id => dTags.includes(id)).map(id => parseEvent(allContent.find(content => content?.tags?.find(tag => tag[0] === 'd')?.[1] === id)));
            setLessons(lessons);
        }
    }, [lessonIds, allContent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!ndk.signer) {
                await addSigner();
            }

            const event = new NDKEvent(ndk);
            event.kind = course.kind;
            event.content = content;
            event.tags = [
                ['d', course.d],
                ['name', title],
                ['about', summary],
                ['image', coverImage],
                ...topics.filter(t => t.trim()).map(topic => ['t', topic.toLowerCase()]),
                ['published_at', Math.floor(Date.now() / 1000).toString()],
                ...(isPaidCourse ? [['price', price.toString()]] : []),
                // Preserve existing lesson references
                ...lessons.map(lesson => ['a', `${lesson.kind}:${lesson.pubkey}:${lesson.d}`])
            ];

            await ndk.publish(event);

            // Update course in database
            await axios.put(`/api/courses/${course.d}`, {
                price: isPaidCourse ? Number(price) : 0,
                lessons: lessons.map(lesson => ({
                    resourceId: lesson.d,
                    draftId: null,
                    index: lessons.indexOf(lesson)
                }))
            });

            showToast('success', 'Success', 'Course updated successfully');
            router.push(`/course/${course.d}`);
        } catch (error) {
            console.error('Error updating course:', error);
            showToast('error', 'Error', 'Failed to update course');
        } finally {
            setLoading(false);
        }
    };

    const handleTopicChange = (index, value) => {
        const updatedTopics = topics.map((topic, i) => i === index ? value : topic);
        setTopics(updatedTopics);
    };

    const addTopic = (e) => {
        e.preventDefault();
        setTopics([...topics, '']);
    };

    const removeTopic = (e, index) => {
        e.preventDefault();
        const updatedTopics = topics.filter((_, i) => i !== index);
        setTopics(updatedTopics);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-inputgroup flex-1">
                <InputText 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Title" 
                />
            </div>

            <div className="p-inputgroup flex-1 mt-4">
                <InputTextarea 
                    value={summary} 
                    onChange={(e) => setSummary(e.target.value)} 
                    placeholder="Summary" 
                    rows={5} 
                />
            </div>

            <div className="p-inputgroup flex-1 mt-4">
                <InputText 
                    value={coverImage} 
                    onChange={(e) => setCoverImage(e.target.value)} 
                    placeholder="Cover Image URL" 
                />
            </div>

            <div className="p-inputgroup flex-1 mt-8 flex-col">
                <p className="py-2">Paid Course</p>
                <InputSwitch 
                    checked={isPaidCourse} 
                    onChange={(e) => setIsPaidCourse(e.value)} 
                />
                {isPaidCourse && (
                    <div className="p-inputgroup flex-1 py-4">
                        <InputNumber 
                            value={price} 
                            onValueChange={(e) => setPrice(e.value)} 
                            placeholder="Price (sats)" 
                            min={1}
                        />
                    </div>
                )}
            </div>

            <LessonSelector
                    isPaidCourse={isPaidCourse}
                    lessons={lessons}
                    setLessons={setLessons}
                    allContent={allContent}
                    // onNewResourceCreate={handleNewResourceCreate}
                    // onNewVideoCreate={handleNewVideoCreate}
                />

            <div className="mt-4 flex-col w-full">
                {topics.map((topic, index) => (
                    <div key={index} className="p-inputgroup flex-1 mt-4">
                        <InputText 
                            value={topic} 
                            onChange={(e) => handleTopicChange(index, e.target.value)} 
                            placeholder={`Topic #${index + 1}`} 
                            className="w-full" 
                        />
                        {index > 0 && (
                            <GenericButton 
                                icon="pi pi-times" 
                                className="p-button-danger mt-2" 
                                onClick={(e) => removeTopic(e, index)} 
                            />
                        )}
                    </div>
                ))}
                <GenericButton 
                    icon="pi pi-plus" 
                    onClick={addTopic} 
                    className="p-button-outlined mt-2" 
                />
            </div>

            <div className="flex justify-center mt-8">
                <GenericButton 
                    type="submit" 
                    severity="success" 
                    outlined 
                    label="Update Course"
                    loading={loading}
                />
            </div>
        </form>
    );
};

export default PublishedCourseForm;