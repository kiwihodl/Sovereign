import React, { useEffect, useState, useMemo } from 'react';
import GenericCarousel from '@/components/content/carousels/GenericCarousel';
import { parseEvent, parseCourseEvent } from '@/utils/nostr';
import { useDocuments } from '@/hooks/nostr/useDocuments';
import { useVideos } from '@/hooks/nostr/useVideos';
import { useCourses } from '@/hooks/nostr/useCourses';
import { TabMenu } from 'primereact/tabmenu';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import GenericButton from '@/components/buttons/GenericButton';
import { useRouter } from 'next/router';

const MenuTab = ({ items, selectedTopic, onTabChange }) => {
    const router = useRouter();
    // spread the items except for 'document' 'video' and 'course'
    const allItems = ['All', ...items.filter(item => item !== 'document' && item !== 'video' && item !== 'course')];

    const menuItems = allItems.map((item, index) => {
        let icon = 'pi pi-tag';
        if (item === 'All') icon = 'pi pi-eye';
        else if (item === 'Documents') icon = 'pi pi-file';
        else if (item === 'Videos') icon = 'pi pi-video';
        else if (item === 'Courses') icon = 'pi pi-desktop';

        const queryParam = item === 'all' ? '' : `?tag=${item.toLowerCase()}`;
        const isActive = router.asPath === `/content${queryParam}`;

        return {
            label: (
                <GenericButton
                    className={`${isActive ? 'bg-primary text-white' : ''}`}
                    onClick={() => {
                        onTabChange(item);
                        router.push(`/content${queryParam}`);
                    }}
                    outlined={!isActive}
                    rounded
                    size='small'
                    label={item}
                    icon={icon}
                />
            ),
            command: () => {
                onTabChange(item);
                router.push(`/content${queryParam}`);
            }
        };
    });

    return (
        <div className="w-full">
            <TabMenu
                model={menuItems}
                activeIndex={allItems.indexOf(selectedTopic)}
                onTabChange={(e) => onTabChange(allItems[e.index])}
                pt={{
                    menu: { className: 'bg-transparent border-none ml-2 my-4 py-1' },
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
    const router = useRouter();
    const { documents, documentsLoading } = useDocuments();
    const { videos, videosLoading } = useVideos();
    const { courses, coursesLoading } = useCourses();

    const [processedDocuments, setProcessedDocuments] = useState([]);
    const [processedVideos, setProcessedVideos] = useState([]);
    const [processedCourses, setProcessedCourses] = useState([]);
    const [allContent, setAllContent] = useState([]);
    const [allTopics, setAllTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('All')
    const [filteredContent, setFilteredContent] = useState([]);

    const memoizedFilteredContent = useMemo(() => filteredContent, [filteredContent]);

    useEffect(() => {
        const tag = router.query.tag;
        if (tag) {
            const topic = tag.charAt(0).toUpperCase() + tag.slice(1);
            setSelectedTopic(topic);
        } else {
            setSelectedTopic('All');
        }
    }, [router.query.tag]);

    useEffect(() => {
        if (documents && !documentsLoading) {
            const processedDocuments = documents.map(document => ({...parseEvent(document), type: 'document'}));
            setProcessedDocuments(processedDocuments);
        }
    }, [documents, documentsLoading]);

    useEffect(() => {
        if (videos && !videosLoading) {
            const processedVideos = videos.map(video => ({...parseEvent(video), type: 'video'}));
            setProcessedVideos(processedVideos);
        }
    }, [videos, videosLoading]);

    useEffect(() => {
        if (courses && !coursesLoading) {
            const processedCourses = courses.map(course => ({...parseCourseEvent(course), type: 'course'}));
            setProcessedCourses(processedCourses);
        }
    }, [courses, coursesLoading]);

    useEffect(() => {
        const allContent = [...processedDocuments, ...processedVideos, ...processedCourses];
        setAllContent(allContent);

        const uniqueTopics = new Set(allContent.map(item => item.topics).flat());
        const priorityItems = ['All', 'Courses', 'Videos', 'Documents'];
        const otherTopics = Array.from(uniqueTopics).filter(topic => !priorityItems.includes(topic));
        const combinedTopics = [...priorityItems.slice(1), ...otherTopics];
        setAllTopics(combinedTopics);

        if (selectedTopic) {
            filterContent(selectedTopic, allContent);
        }
    }, [processedDocuments, processedVideos, processedCourses]);

    const filterContent = (topic, content) => {
        let filtered = content;
        if (topic !== 'All') {
            const topicLower = topic.toLowerCase();
            if (['courses', 'videos', 'documents'].includes(topicLower)) {
                filtered = content.filter(item => item.type === topicLower.slice(0, -1));
            } else {
                filtered = content.filter(item => item.topics && item.topics.includes(topic.toLowerCase()));
            }
        }

        setFilteredContent(filtered);
    };

    const handleTopicChange = (newTopic) => {
        setSelectedTopic(newTopic);
        const queryParam = newTopic === 'All' ? '' : `?tag=${newTopic.toLowerCase()}`;
        router.push(`/content${queryParam}`, undefined, { shallow: true });
        filterContent(newTopic, allContent);
    };

    const renderCarousels = () => {
        return (
            <GenericCarousel
                key={`${selectedTopic}-${memoizedFilteredContent.length}`}
                items={memoizedFilteredContent}
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
            </div>
            <MenuTab
                items={['Courses', 'Videos', 'Documents', ...allTopics.filter(topic => !['Courses', 'Videos', 'Documents'].includes(topic))]}
                selectedTopic={selectedTopic}
                onTabChange={handleTopicChange}
                className="max-w-[90%] mx-auto"
            />
            {renderCarousels()}
        </div>
    );
};

export default ContentPage;