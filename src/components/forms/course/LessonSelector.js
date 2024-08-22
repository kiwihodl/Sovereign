import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import ResourceForm from '../ResourceForm';
import WorkshopForm from '../WorkshopForm';
import ContentDropdownItem from '@/components/content/dropdowns/ContentDropdownItem';
import SelectedContentItem from '@/components/content/SelectedContentItem';
import { parseEvent } from '@/utils/nostr';

const LessonSelector = ({ isPaidCourse, lessons, setLessons, allContent }) => {
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [showWorkshopForm, setShowWorkshopForm] = useState(false);
    const [contentOptions, setContentOptions] = useState([]);

    useEffect(() => {
        updateContentOptions();
    }, [allContent, isPaidCourse, lessons]);

    const updateContentOptions = () => {
        if (!allContent || allContent.length === 0) {
            setContentOptions([]);
            return;
        }

        const filterContent = (content) => {
            const contentPrice = content.price || 0;
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

    const handleContentSelect = (selectedContent) => {
        if (selectedContent && !lessons.some(lesson => lesson.id === selectedContent.id)) {
            setLessons([...lessons, selectedContent]);
        }
    };

    const removeLesson = (index) => {
        const updatedLessons = lessons.filter((_, i) => i !== index);
        setLessons(updatedLessons);
    };

    const handleNewResourceSave = (newResource) => {
        setLessons([...lessons, newResource]);
        setShowResourceForm(false);
    };

    const handleNewWorkshopSave = (newWorkshop) => {
        setLessons([...lessons, newWorkshop]);
        setShowWorkshopForm(false);
    };

    return (
        <div className="mt-8">
            <h3>Lessons</h3>
            {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex mt-4">
                    <SelectedContentItem content={lesson} />
                    <Button 
                        icon="pi pi-times"
                        className="p-button-danger rounded-tl-none rounded-bl-none" 
                        onClick={() => removeLesson(index)}
                    />
                </div>
            ))}
            <div className="p-inputgroup flex-1 mt-4">
                <Dropdown
                    options={contentOptions}
                    onChange={(e) => handleContentSelect(e.value)}
                    placeholder="Select Existing Lesson"
                    optionLabel="label"
                    optionGroupLabel="label"
                    optionGroupChildren="items"
                    itemTemplate={(option) => <ContentDropdownItem content={option.value} onSelect={handleContentSelect} />}
                    value={null}
                />
            </div>
            <div className="flex mt-4">
                <Button label="New Resource" onClick={() => setShowResourceForm(true)} className="mr-2" />
                <Button label="New Workshop" onClick={() => setShowWorkshopForm(true)} />
            </div>

            <Dialog visible={showResourceForm} onHide={() => setShowResourceForm(false)} header="Create New Resource">
                <ResourceForm onSave={handleNewResourceSave} isPaid={isPaidCourse} />
            </Dialog>

            <Dialog visible={showWorkshopForm} onHide={() => setShowWorkshopForm(false)} header="Create New Workshop">
                <WorkshopForm onSave={handleNewWorkshopSave} isPaid={isPaidCourse} />
            </Dialog>
        </div>
    );
};

export default LessonSelector;