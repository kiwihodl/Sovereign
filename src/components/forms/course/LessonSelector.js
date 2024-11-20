import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import GenericButton from '@/components/buttons/GenericButton';
import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import EmbeddedDocumentForm from '@/components/forms/course/embedded/EmbeddedDocumentForm';
import EmbeddedVideoForm from '@/components/forms/course/embedded/EmbeddedVideoForm';
import ContentDropdownItem from '@/components/content/dropdowns/ContentDropdownItem';
import SelectedContentItem from '@/components/content/SelectedContentItem';
import { parseEvent } from '@/utils/nostr';

const LessonSelector = ({ isPaidCourse, lessons, setLessons, allContent, onNewResourceCreate, onNewVideoCreate }) => {
    const [showDocumentForm, setShowDocumentForm] = useState(false);
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [contentOptions, setContentOptions] = useState([]);
    const [openTabs, setOpenTabs] = useState([]);

    useEffect(() => {
        updateContentOptions();
        console.log("lessons", lessons);
    }, [allContent, isPaidCourse, lessons]);

    useEffect(() => {
        setOpenTabs(lessons.map((_, index) => index));
    }, [lessons]);

    const updateContentOptions = () => {
        if (!allContent || allContent.length === 0) {
            setContentOptions([]);
            return;
        }

        const filterContent = (content) => {
            const contentPrice = content?.price || (content?.tags && content?.tags.find(tag => tag[0] === 'price')?.[1]) || 0;
            return isPaidCourse ? contentPrice > 0 : true;
        };

        const filteredContent = allContent.filter(filterContent)
            .filter(content => !lessons.some(lesson => lesson.id === content.id))
            .map(content => {
                if (content?.kind) {
                    return parseEvent(content);
                } else {
                    return content;
                }
            });

        console.log('filtered content', filteredContent)

        const draftDocumentOptions = filteredContent.filter(content => content?.topics.includes('document') && !content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        const draftVideoOptions = filteredContent.filter(content => content?.topics.includes('video') && !content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        const documentOptions = filteredContent.filter(content => content?.topics.includes('document') && content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        const videoOptions = filteredContent.filter(content => content?.type === "video" && content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        const combinedOptions = filteredContent.filter(content => content?.topics?.includes('video') && content?.topics?.includes('document') && content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        setContentOptions([
            {
                label: 'Draft Documents',
                items: draftDocumentOptions
            },
            {
                label: 'Draft Videos',
                items: draftVideoOptions
            },
            {
                label: 'Published Documents',
                items: documentOptions
            },
            {
                label: 'Published Videos',
                items: videoOptions
            },
            {
                label: 'Published Combined',
                items: combinedOptions
            }
        ]);
    };

    useEffect(() => {
        console.log("contentOptions", contentOptions);
    }, [contentOptions]);

    const handleContentSelect = (selectedContent, index) => {
        if (selectedContent) {
            const updatedLessons = [...lessons];
            updatedLessons[index] = { ...selectedContent, index };
            setLessons(updatedLessons);
        }
    };

    const handleRemoveContent = (index) => {
        const updatedLessons = [...lessons];
        updatedLessons[index] = { index }; // Reset the lesson to an empty state
        setLessons(updatedLessons);
    };

    const removeLesson = (index) => {
        const updatedLessons = lessons.filter((_, i) => i !== index)
            .map((lesson, newIndex) => ({ ...lesson, index: newIndex }));
        setLessons(updatedLessons);
    };

    const addNewLesson = (e) => {
        e.preventDefault(); // Prevent form submission
        setLessons([...lessons, { index: lessons.length }]);
    };

    const handleNewDocumentSave = async (newDocument) => {
        const createdDocument = await onNewDocumentCreate(newDocument);
        if (createdDocument) {
            handleContentSelect(createdDocument, lessons.length);
            setShowDocumentForm(false);
        }
    };

    const handleNewVideoSave = async (newVideo) => {
        const createdVideo = await onNewVideoCreate(newVideo);
        if (createdVideo) {
            handleContentSelect(createdVideo, lessons.length);
            setShowVideoForm(false);
        }
    };

    const handleTabChange = (e) => {
        setOpenTabs(e.index);
    };

    const AccordianHeader = ({lesson, index}) => {
        return (
            <div className="flex justify-between items-center">
                <p>Lesson {index + 1}</p>
                <GenericButton icon="pi pi-times" className="p-button-danger" onClick={() => removeLesson(index)} />
            </div>
        );
    };

    return (
        <div className="mt-8">
            <h3>Lessons</h3>
            <Accordion multiple activeIndex={openTabs} onTabChange={handleTabChange}>
                {lessons.map((lesson, index) => (
                    <AccordionTab key={index} header={<AccordianHeader lesson={lesson} index={index} />}>
                        <div className="p-inputgroup flex-1 mt-4">
                            <Dropdown
                                options={contentOptions}
                                onChange={(e) => handleContentSelect(e.value, index)}
                                placeholder={lesson.id ? lesson.title : "Select Lesson"}
                                optionLabel="label"
                                optionGroupLabel="label"
                                optionGroupChildren="items"
                                itemTemplate={(option) => <ContentDropdownItem content={option.value} onSelect={(content) => handleContentSelect(content, index)} />}
                                value={lesson.id ? lesson : null}
                            />
                        </div>
                        <div className="flex mt-4">
                            {lesson.id ? null : (
                                <>
                                    <GenericButton label="New Document" onClick={(e) => {e.preventDefault(); setShowDocumentForm(true)}} className="mr-2" />
                                    <GenericButton label="New Video" onClick={(e) => {e.preventDefault(); setShowVideoForm(true)}} className="mr-2" />
                                </>
                            )}
                        </div>
                        {lesson.id && (
                            <div className="mt-4">
                                <SelectedContentItem 
                                    content={lesson} 
                                    onRemove={() => handleRemoveContent(index)}
                                />
                            </div>
                        )}
                    </AccordionTab>
                ))}
            </Accordion>
            <GenericButton 
                label="Add New Lesson" 
                onClick={addNewLesson} 
                className="mt-4" 
                type="button"
            />

            <Dialog className='w-full max-w-screen-md' visible={showDocumentForm} onHide={() => setShowDocumentForm(false)} header="Create New Document">
                <EmbeddedDocumentForm onSave={handleNewDocumentSave} isPaid={isPaidCourse} />
            </Dialog>

            <Dialog className='w-full max-w-screen-md' visible={showVideoForm} onHide={() => setShowVideoForm(false)} header="Create New Video">
                <EmbeddedVideoForm onSave={handleNewVideoSave} isPaid={isPaidCourse} />
            </Dialog>
        </div>
    );
};

export default LessonSelector;