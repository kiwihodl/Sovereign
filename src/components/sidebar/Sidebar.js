import React, { useState, useEffect, useCallback } from 'react';
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
    const { isAdmin } = useIsAdmin();
    const [lessons, setLessons] = useState([]);
    const router = useRouter();
    const { showToast } = useToast();
    const { ndk, addSigner } = useNDKContext();

    // Helper function to determine if the path matches the current route
    const isActive = (path) => {
        if (path === '/content') {
            return router.pathname === '/content';
        }
        if (path === '/feed') {
            return router.pathname === '/feed';
        }
        return router.asPath === path;
    };

    const { data: session } = useSession();

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
                                '#d': [id]
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
        <div className="max-sidebar:hidden bg-gray-800 p-2 fixed h-[100%] flex flex-col w-[14vw]">
            <div className="flex-grow overflow-y-auto">
                {course && lessons.length > 0 && (
                    <div className="flex-grow overflow-y-auto">
                        <div onClick={() => router.push('/')} className="w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg">
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
                {!course && (
                    <div className="flex-grow overflow-y-auto">
                        <div onClick={() => router.push('/')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/') ? 'bg-gray-700' : ''}`}>
                            <i className="pi pi-home pl-5" /> <p className="pl-2 rounded-md font-bold text-lg">Home</p>
                        </div>
                        <div onClick={() => router.push('/content?tag=all')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/content') || router.pathname === '/content' ? 'bg-gray-700' : ''}`}>
                            <i className="pi pi-play-circle pl-5" /> <p className="pl-2 rounded-md font-bold text-lg">Content</p>
                        </div>
                        <div onClick={() => router.push('/feed?channel=global')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/feed') ? 'bg-gray-700' : ''}`}>
                            <i className="pi pi-comments pl-5" /> <p className="pl-2 rounded-md font-bold text-lg">Feeds</p>
                        </div>
                        {isAdmin && (
                            <div onClick={() => router.push('/create')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/create') ? 'bg-gray-700' : ''}`}>
                                <i className="pi pi-plus pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Create</p>
                            </div>
                        )}
                        <div onClick={() => session ? router.push('/profile?tab=subscribe') : router.push('/subscribe')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/profile?tab=subscribe') || isActive('/subscribe') ? 'bg-gray-700' : ''}`}>
                            <i className="pi pi-star pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Subscribe</p>
                        </div>
                    </div>
                )}
            </div>
            <Divider className='pt-0 mt-0' />
            <div className='mt-auto'>
                <div onClick={() => router.push('/profile?tab=settings')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/profile?tab=settings') ? 'bg-gray-700' : ''}`}>
                    <i className="pi pi-cog pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Settings</p>
                </div>
                <div onClick={() => session ? signOut() : router.push('/auth/signin')} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg ${isActive('/auth/signin') ? 'bg-gray-700' : ''}`}>
                    <i className={`pi ${session ? 'pi-sign-out' : 'pi-sign-in'} pl-5 text-sm`} /> <p className="pl-2 rounded-md font-bold text-lg">{session ? 'Logout' : 'Login'}</p>
                </div>
                {/* todo: have to add this extra button to push the sidebar to the right space but it doesnt seem to cause any negative side effects? */}
                <div onClick={signOut} className={`w-full flex flex-row items-center cursor-pointer py-2 my-2 hover:bg-gray-700 rounded-lg`}>
                    <i className="pi pi-sign-out pl-5 text-sm" /> <p className="pl-2 rounded-md font-bold text-lg">Logout</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
