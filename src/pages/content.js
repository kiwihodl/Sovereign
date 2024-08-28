import React, { useEffect, useState } from 'react';
import GenericCarousel from '@/components/content/carousels/GenericCarousel';
import { parseEvent, parseCourseEvent } from '@/utils/nostr';
import { useResources } from '@/hooks/nostr/useResources';
import { useWorkshops } from '@/hooks/nostr/useWorkshops';
import { useCourses } from '@/hooks/nostr/useCourses';
import { TabMenu } from 'primereact/tabmenu';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const MenuTab = ({ items, selectedTopic, onTabChange }) => {
    const allItems = ['All', ...items];

    const menuItems = allItems.map((item, index) => {
        let icon = 'pi pi-tag';
        if (item === 'All') icon = 'pi pi-eye';
        else if (item === 'resource') icon = 'pi pi-file';
        else if (item === 'workshop') icon = 'pi pi-video';
        else if (item === 'course') icon = 'pi pi-desktop';

        return {
            label: (
                <Button
                    className={`${selectedTopic === item ? 'bg-primary text-white' : ''}`}
                    onClick={() => onTabChange(item)}
                    outlined={selectedTopic !== item}
                    rounded
                    size='small'
                    label={item}
                    icon={icon}
                />
            ),
            command: () => onTabChange(item)
        };
    });

    return (
        <div className="w-full">
            <TabMenu
                model={menuItems}
                activeIndex={allItems.indexOf(selectedTopic)}
                onTabChange={(e) => onTabChange(allItems[e.index])}
                pt={{
                    menu: { className: 'bg-transparent border-none ml-2 my-4' },
                    action: ({ context, parent }) => ({
                        className: 'cursor-pointer select-none flex items-center relative no-underline overflow-hidden border-b-2 p-2 font-bold rounded-t-lg',
                        style: { top: '2px' }
                    }),
                    menuitem: { className: 'mr-0' }
                }}
            />
        </div>
    );
}

const ContentPage = () => {
    const { resources, resourcesLoading } = useResources();
    const { workshops, workshopsLoading } = useWorkshops();
    const { courses, coursesLoading } = useCourses();

    const [processedResources, setProcessedResources] = useState([]);
    const [processedWorkshops, setProcessedWorkshops] = useState([]);
    const [processedCourses, setProcessedCourses] = useState([]);
    const [allContent, setAllContent] = useState([]);
    const [allTopics, setAllTopics] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [filteredContent, setFilteredContent] = useState([]);

    useEffect(() => {
        console.log(selectedTopic);
    }, [selectedTopic]);

    useEffect(() => {
        if (resources && !resourcesLoading) {
            const processedResources = resources.map(resource => parseEvent(resource));
            setProcessedResources(processedResources);
        }
    }, [resources, resourcesLoading]);

    useEffect(() => {
        if (workshops && !workshopsLoading) {
            const processedWorkshops = workshops.map(workshop => parseEvent(workshop));
            setProcessedWorkshops(processedWorkshops);
        }
    }, [workshops, workshopsLoading]);

    useEffect(() => {
        if (courses && !coursesLoading) {
            const processedCourses = courses.map(course => parseCourseEvent(course));
            setProcessedCourses(processedCourses);
        }
    }, [courses, coursesLoading]);

    useEffect(() => {
        const uniqueTopics = new Set([...processedResources, ...processedWorkshops, ...processedCourses].map(item => item.topics).flat());
        const priorityItems = ['All', 'course', 'workshop', 'resource'];
        const otherTopics = Array.from(uniqueTopics).filter(topic => !priorityItems.includes(topic));
        setAllTopics([...priorityItems.slice(1), ...otherTopics]);
        setAllContent([...processedResources, ...processedWorkshops, ...processedCourses]);
    }, [processedResources, processedWorkshops, processedCourses]);

    useEffect(() => {
        let filtered = allContent;
        if (selectedTopic !== 'All') {
            if (['course', 'workshop', 'resource'].includes(selectedTopic)) {
                filtered = allContent.filter(item => item.type === selectedTopic);
            } else {
                filtered = allContent.filter(item => item.topics && item.topics.includes(selectedTopic));
            }
        }
        setFilteredContent(filtered);
    }, [selectedTopic, allContent]);

    const handleTopicChange = (newTopic) => {
        setSelectedTopic(newTopic);
    };

    const renderCarousels = () => {
        return (
            <GenericCarousel
                items={filteredContent}
                selectedTopic={selectedTopic}
                title={`${selectedTopic} Content`}
                type="all"
            />
        );
    };

    return (
        <div className="w-full px-4">
            <div className="w-fit mx-4 mt-8 flex flex-col items-start">
                <h1 className="text-3xl font-bold mb-4 ml-1">All Content</h1>
                <InputText
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    icon="pi pi-search"
                    className="w-full"
                />
            </div>
            <MenuTab
                items={allTopics}
                selectedTopic={selectedTopic}
                onTabChange={handleTopicChange}
                className="max-w-[90%] mx-auto"
            />
            {renderCarousels()}
        </div>
    );
};

export default ContentPage;