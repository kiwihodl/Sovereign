import React, { useState, useEffect, useCallback } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { nip19 } from 'nostr-tools';
import { useToast } from '@/hooks/useToast';
import { useNDKContext } from '@/context/NDKContext';
import 'primeicons/primeicons.css';
import styles from "./sidebar.module.css";
import { Divider } from 'primereact/divider';

const Sidebar = ({ course = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { isAdmin } = useIsAdmin();
    const [lessons, setLessons] = useState([]);
    const router = useRouter();
    const { showToast } = useToast();
    const { ndk, addSigner } = useNDKContext();

    // Helper function to determine if the path matches the current route
    const isActive = (path) => {
        return router.asPath === path;
    };

    const { data: session } = useSession();

    useEffect(() => {
        // Notify parent component about sidebar state change
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isExpanded } }));
        }
    }, [isExpanded]);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            try {
                if (slug && course) {
                    const { data } = nip19.decode(slug)

                    if (!data) {
                        showToast('error', 'Error', 'Course not found');
                        return;
                    }

                    const id = data?.identifier;
                    const fetchCourse = async (id) => {
                        try {
                            await ndk.connect();

                            const filter = {
                                ids: [id]
                            }

                            const event = await ndk.fetchEvent(filter);

                            if (event) {
                                // all a tags are lessons
                                const lessons = event.tags.filter(tag => tag[0] === 'a');
                                const uniqueLessons = [...new Set(lessons.map(lesson => lesson[1]))];
                                setLessons(uniqueLessons);
                            }
                        } catch (error) {
                            console.error('Error fetching event:', error);
                        }
                    };
                    if (ndk && id) {
                        fetchCourse(id);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
    }, [router.isReady, router.query, ndk, course]);

    const scrollToLesson = useCallback((index) => {
        const lessonElement = document.getElementById(`lesson-${index}`);
        if (lessonElement) {
            lessonElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        if (router.isReady && router.query.active) {
            const activeIndex = parseInt(router.query.active);
            scrollToLesson(activeIndex);
        }
    }, [router.isReady, router.query.active, scrollToLesson]);

    return (
        <div className={`max-sidebar:hidden bg-gray-800 p-2 fixed h-[100%] flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-[14vw]' : 'w-[50px]'}`}>
            <div className="flex-grow overflow-y-auto">
                {course && lessons.length > 0 && (
                    <div className="flex-grow overflow-y-auto">
                        <div onClick={() => router.push('/')} className={"w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg"}>
                            <i className="pi pi-arrow-left pl-5" /> <p className="pl-2 rounded-md font-bold text-lg">Home</p>
                        </div>
                        {lessons.map((lesson, index) => (
                            <div
                                key={lesson}
                                onClick={() => {
                                    router.push(`/course/${router?.query?.slug}?active=${index}`, undefined, { shallow: true });
                                    scrollToLesson(index);
                                }}
                                className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive(`/course/${router?.query?.slug}?active=${index}`) ? 'bg-gray-700' : ''}`}
                            >
                                <i className="pi pi-lightbulb text-sm pl-5" /> <p className="pl-2 rounded-md font-bold text-lg">Lesson {index + 1}</p>
                            </div>
                        ))}
                    </div>
                )}
                {isExpanded && !course ? (
                    <div className="flex-grow overflow-y-auto">
                        <div onClick={() => router.push('/')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/') ? 'bg-gray-700' : ''}`}>
                            <i className="pi pi-home pl-5" /> <p className="pl-2 rounded-md font-bold text-lg">Home</p>
                        </div>
                        <Accordion activeIndex={0} className={styles['p-accordion']} style={{ marginBottom: '0px', paddingBottom: '0px' }}>
                            <AccordionTab
                                pt={{
                                    headerAction: ({ context }) => ({
                                        className: `hover:bg-gray-700 rounded-lg ${isActive('/content') || router.pathname === '/content' ? 'bg-gray-700' : ''} ${styles['p-accordion-header-link']}`
                                    }),
                                    content: styles['p-accordion-content'],
                                    header: 'text-lg'
                                }}
                                header={'Content'}>
                                <div onClick={() => router.push('/content?tag=all')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=all') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-eye text-sm pr-1"></i> All</p>
                                </div>
                                <div onClick={() => router.push('/content?tag=courses')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=courses') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-desktop text-sm pr-1"></i> Courses</p>
                                </div>
                                <div onClick={() => router.push('/content?tag=videos')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=videos') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-video text-sm pr-1"></i> Videos</p>
                                </div>
                                <div onClick={() => router.push('/content?tag=documents')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content?tag=documents') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-file text-sm pr-1"></i> Documents</p>
                                </div>
                            </AccordionTab>
                        </Accordion>
                        {isAdmin && (
                            <div onClick={() => router.push('/create')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/create') ? 'bg-gray-700' : ''}`}>
                                <i className="pi pi-plus pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Create</p>
                            </div>
                        )}
                        <div onClick={() => session ? router.push('/profile?tab=subscribe') : router.push('/subscribe')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/profile?tab=subscribe') || isActive('/subscribe') ? 'bg-gray-700' : ''}`}>
                            <i className="pi pi-star pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Subscribe</p>
                        </div>
                        <Accordion activeIndex={0} className={styles['p-accordion']}>
                            <AccordionTab
                                pt={{
                                    headerAction: ({ context }) => ({
                                        className: `hover:bg-gray-700 rounded-lg ${isActive('/feed') ? 'bg-gray-700' : ''} ${styles['p-accordion-header-link']}`
                                    }),
                                    content: styles['p-accordion-content'],
                                    header: 'text-lg'
                                }}
                                header={"Feeds"}>
                                <div onClick={() => router.push('/feed?channel=global')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=global') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> global</p>
                                </div>
                                <div onClick={() => router.push('/feed?channel=nostr')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=nostr') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> nostr</p>
                                </div>
                                <div onClick={() => router.push('/feed?channel=discord')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=discord') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> discord</p>
                                </div>
                                <div onClick={() => router.push('/feed?channel=stackernews')} className={`w-full cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed?channel=stackernews') ? 'bg-gray-700' : ''}`}>
                                    <p className="pl-3 rounded-md font-bold text-lg"><i className="pi pi-hashtag text-sm pr-1"></i> stackernews</p>
                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>
                ) : (
                    // Collapsed sidebar content (icons only)
                    !course && (
                        <div className="flex flex-col items-center">
                            <i className="pi pi-home my-4 cursor-pointer" onClick={() => router.push('/')} />
                            <i className="pi pi-list my-4 cursor-pointer" onClick={() => router.push('/content')} />
                            <i className="pi pi-plus my-4 cursor-pointer" onClick={() => router.push('/create')} />
                            <i className="pi pi-star my-4 cursor-pointer" onClick={() => session ? router.push('/profile?tab=subscribe') : router.push('/auth/signin')} />
                            <i className="pi pi-users my-4 cursor-pointer" onClick={() => router.push('/feed')} />
                        </div>
                    )
                )}
            </div>
            <Divider className='pt-0 mt-0' />
            <div className='mt-auto'>
                {isExpanded ? (
                    <div className='mt-auto'>
                        <div onClick={() => router.push('/profile?tab=settings')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/profile?tab=settings') ? 'bg-gray-700' : ''}`}>
                            <i className="pi pi-cog pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Settings</p>
                        </div>
                        <div onClick={() => session ? signOut() : router.push('/auth/signin')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/auth/signin') ? 'bg-gray-700' : ''}`}>
                            <i className={`pi ${session ? 'pi-sign-out' : 'pi-sign-in'} pl-5 text-sm`} /> <p className="pl-2 rounded-md font-bold text-lg">{session ? 'Logout' : 'Login'}</p>
                        </div>
                        {/* todo sidebar expand / contract */}
                        {/* <div onClick={toggleSidebar} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg`}>
                            <i className={`pi pi-chevron-left pl-5 text-sm`} /> <p className="pl-2 rounded-md font-bold text-lg">{isExpanded ? 'close' : 'open'}</p>
                        </div> */}
                        {/* todo: have to add this extra button to push the sidebar to the right space but it doesnt seem to cause any negative side effects? */}
                        <div onClick={signOut} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg`}>
                            <i className="pi pi-sign-out pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Logout</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <i className="pi pi-cog my-4 cursor-pointer" onClick={() => router.push('/profile?tab=settings')} />
                        <i className={`pi ${session ? 'pi-sign-out' : 'pi-sign-in'} my-4 cursor-pointer`} onClick={() => session ? signOut() : router.push('/auth/signin')} />
                        <i className="pi pi-chevron-right my-4 cursor-pointer" onClick={toggleSidebar} />
                        <i className={`pi ${session ? 'pi-sign-out' : 'pi-sign-in'} my-4 cursor-pointer`} onClick={() => session ? signOut() : router.push('/auth/signin')} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
