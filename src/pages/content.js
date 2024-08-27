import React, { useEffect, useState } from 'react';
import GenericCarousel from '@/components/content/carousels/GenericCarousel';
import { parseEvent, parseCourseEvent } from '@/utils/nostr';
import { useResources } from '@/hooks/nostr/useResources';
import { useWorkshops } from '@/hooks/nostr/useWorkshops';
import { useCourses } from '@/hooks/nostr/useCourses';
import { TabMenu } from 'primereact/tabmenu';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';

const MenuTab = ({ items, activeIndex, onTabChange }) => {
    const menuItems = items.map((item, index) => ({
        label: item,
        icon: 'pi pi-tag',
        command: () => onTabChange(index)
    }));

    return (
        <div className="w-full">
            <TabMenu
                model={menuItems}
                activeIndex={activeIndex}
                onTabChange={(e) => onTabChange(e.index)}
                pt={{
                    menu: { className: 'bg-transparent border-none' },
                    action: { className: 'bg-transparent border-none' }
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
        const allTopics = new Set([...processedResources, ...processedWorkshops, ...processedCourses].map(item => item.topics).flat());
        setAllTopics(Array.from(allTopics));
        setAllContent([...processedResources, ...processedWorkshops, ...processedCourses]);
    }, [processedResources, processedWorkshops, processedCourses]);

    useEffect(() => {
        console.log(allTopics);
    }, [allTopics]);

    const renderCarousels = () => {
        const carousels = [];
        for (let i = 0; i < allContent.length; i += 3) {
            const items = allContent.slice(i, i + 3);
            carousels.push(
                <GenericCarousel
                    key={i}
                    items={items}
                    title={`Content Group ${i / 3 + 1}`}
                    type="all"
                />
            );
        }
        return carousels;
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
                />
            </div>
            <MenuTab
                items={allTopics}
                activeIndex={activeIndex}
                onTabChange={setActiveIndex}
                className="max-w-[90%] mx-auto"
            />
            {renderCarousels()}
        </div>
    );
};

export default ContentPage;