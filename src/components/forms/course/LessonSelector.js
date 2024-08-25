import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import EmbeddedResourceForm from '@/components/forms/course/embedded/EmbeddedResourceForm';
import EmbeddedWorkshopForm from '@/components/forms/course/embedded/EmbeddedWorkshopform';
import ContentDropdownItem from '@/components/content/dropdowns/ContentDropdownItem';
import SelectedContentItem from '@/components/content/SelectedContentItem';
import { parseEvent } from '@/utils/nostr';

const LessonSelector = ({ isPaidCourse, lessons, setLessons, allContent, onNewResourceCreate, onNewWorkshopCreate }) => {
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [showWorkshopForm, setShowWorkshopForm] = useState(false);
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

        const draftResourceOptions = filteredContent.filter(content => content?.topics.includes('resource') && !content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        const draftWorkshopOptions = filteredContent.filter(content => content?.topics.includes('workshop') && !content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        const resourceOptions = filteredContent.filter(content => content?.topics.includes('resource') && content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        const workshopOptions = filteredContent.filter(content => content?.topics.includes('workshop') && content.kind).map(content => ({
            label: content.title,
            value: content
        }));

        setContentOptions([
            {
                label: 'Draft Resources',
                items: draftResourceOptions
            },
            {
                label: 'Draft Workshops',
                items: draftWorkshopOptions
            },
            {
                label: 'Published Resources',
                items: resourceOptions
            },
            {
                label: 'Published Workshops',
                items: workshopOptions
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

    const handleNewResourceSave = async (newResource) => {
        const createdResource = await onNewResourceCreate(newResource);
        if (createdResource) {
            handleContentSelect(createdResource, lessons.length);
            setShowResourceForm(false);
        }
    };

    const handleNewWorkshopSave = async (newWorkshop) => {
        console.log('newWorkshop', newWorkshop);
        const createdWorkshop = await onNewWorkshopCreate(newWorkshop);
        if (createdWorkshop) {
            handleContentSelect(createdWorkshop, lessons.length);
            setShowWorkshopForm(false);
        }
    };

    const handleTabChange = (e) => {
        setOpenTabs(e.index);
    };

    const AccordianHeader = ({lesson, index}) => {
        return (
            <div className="flex justify-between items-center">
                <p>Lesson {index + 1}</p>
                <Button icon="pi pi-times" className="p-button-danger" onClick={() => removeLesson(index)} />
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
                                placeholder="Select Existing Lesson"
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
                                    <Button label="New Resource" onClick={(e) => {e.preventDefault(); setShowResourceForm(true)}} className="mr-2" />
                                    <Button label="New Workshop" onClick={(e) => {e.preventDefault(); setShowWorkshopForm(true)}} className="mr-2" />
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
            <Button 
                label="Add New Lesson" 
                onClick={addNewLesson} 
                className="mt-4" 
                type="button" // Explicitly set type to "button"
            />

            <Dialog className='w-full max-w-screen-md' visible={showResourceForm} onHide={() => setShowResourceForm(false)} header="Create New Resource">
                <EmbeddedResourceForm onSave={handleNewResourceSave} isPaid={isPaidCourse} />
            </Dialog>

            <Dialog className='w-full max-w-screen-md' visible={showWorkshopForm} onHide={() => setShowWorkshopForm(false)} header="Create New Workshop">
                <EmbeddedWorkshopForm onSave={handleNewWorkshopSave} isPaid={isPaidCourse} />
            </Dialog>
        </div>
    );
};

export default LessonSelector;