import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { parseCourseEvent, parseEvent, findKind0Fields } from '@/utils/nostr';
import CourseDetails from '@/components/content/courses/CourseDetails';
import VideoLesson from '@/components/content/courses/VideoLesson';
import DocumentLesson from '@/components/content/courses/DocumentLesson';
import CombinedLesson from '@/components/content/courses/CombinedLesson';
import CourseSidebar from '@/components/content/courses/CourseSidebar';
import CourseHeader from '@/components/content/courses/CourseHeader';
import { useNDKContext } from '@/context/NDKContext';
import { useSession } from 'next-auth/react';
import { nip19 } from 'nostr-tools';
import { useToast } from '@/hooks/useToast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDecryptContent } from '@/hooks/encryption/useDecryptContent';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import appConfig from '@/config/appConfig';
import useWindowWidth from '@/hooks/useWindowWidth';
import MenuTab from '@/components/menutab/MenuTab';
import { Tag } from 'primereact/tag';
import MarkdownDisplay from '@/components/markdown/MarkdownDisplay';

const useCourseData = (ndk, fetchAuthor, router) => {
  const [course, setCourse] = useState(null);
  const [lessonIds, setLessonIds] = useState([]);
  const [paidCourse, setPaidCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!router.isReady) return;

    const { slug } = router.query;
    let id;

    const fetchCourseId = async () => {
      if (slug.includes('naddr')) {
        const { data } = nip19.decode(slug);
        if (!data?.identifier) {
          showToast('error', 'Error', 'Resource not found');
          return null;
        }
        return data.identifier;
      } else {
        return slug;
      }
    };

    const fetchCourse = async courseId => {
      try {
        await ndk.connect();
        const event = await ndk.fetchEvent({ '#d': [courseId] });
        if (!event) return null;

        const author = await fetchAuthor(event.pubkey);
        const lessonIds = event.tags.filter(tag => tag[0] === 'a').map(tag => tag[1].split(':')[2]);

        const parsedCourse = { ...parseCourseEvent(event), author };
        return { parsedCourse, lessonIds };
      } catch (error) {
        console.error('Error fetching event:', error);
        return null;
      }
    };

    const initializeCourse = async () => {
      setLoading(true);
      id = await fetchCourseId();
      if (!id) {
        setLoading(false);
        return;
      }

      const courseData = await fetchCourse(id);
      if (courseData) {
        const { parsedCourse, lessonIds } = courseData;
        setCourse(parsedCourse);
        setLessonIds(lessonIds);
        setPaidCourse(parsedCourse.price && parsedCourse.price > 0);
      }
      setLoading(false);
    };

    initializeCourse();
  }, [router.isReady, router.query, ndk, fetchAuthor, showToast]);

  return { course, lessonIds, paidCourse, loading };
};

const useLessons = (ndk, fetchAuthor, lessonIds, pubkey) => {
  const [lessons, setLessons] = useState([]);
  const [uniqueLessons, setUniqueLessons] = useState([]);
  const { showToast } = useToast();
  useEffect(() => {
    if (lessonIds.length > 0) {
      const fetchLesson = async lessonId => {
        try {
          await ndk.connect();
          const filter = {
            '#d': [lessonId],
            kinds: [30023, 30402],
            authors: [pubkey],
          };
          const event = await ndk.fetchEvent(filter);
          if (event) {
            const author = await fetchAuthor(event.pubkey);
            const parsedLesson = { ...parseEvent(event), author };
            setLessons(prev => {
              // Check if the lesson already exists in the array
              const exists = prev.some(lesson => lesson.id === parsedLesson.id);
              if (!exists) {
                return [...prev, parsedLesson];
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Error fetching event:', error);
        }
      };
      lessonIds.forEach(lessonId => fetchLesson(lessonId));
    }
  }, [lessonIds, ndk, fetchAuthor, pubkey]);

  useEffect(() => {
    const newUniqueLessons = Array.from(
      new Map(lessons.map(lesson => [lesson.id, lesson])).values()
    );
    setUniqueLessons(newUniqueLessons);
  }, [lessons]);

  return { lessons, uniqueLessons, setLessons };
};

const useDecryption = (session, paidCourse, course, lessons, setLessons) => {
  const [decryptionPerformed, setDecryptionPerformed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { decryptContent } = useDecryptContent();

  useEffect(() => {
    const decrypt = async () => {
      if (session?.user && paidCourse && !decryptionPerformed) {
        setLoading(true);
        const canAccess =
          session.user.purchased?.some(purchase => purchase.courseId === course?.d) ||
          session.user?.role?.subscribed ||
          session.user?.pubkey === course?.pubkey;

        if (canAccess && lessons.length > 0) {
          try {
            const decryptedLessons = await Promise.all(
              lessons.map(async lesson => {
                const decryptedContent = await decryptContent(lesson.content);
                return { ...lesson, content: decryptedContent };
              })
            );
            setLessons(decryptedLessons);
            setDecryptionPerformed(true);
          } catch (error) {
            console.error('Error decrypting lessons:', error);
          }
        }
        setLoading(false);
      }
      setLoading(false);
    };
    decrypt();
  }, [session, paidCourse, course, lessons, decryptionPerformed, setLessons]);

  return { decryptionPerformed, loading };
};

const Course = () => {
  const router = useRouter();
  const { ndk, addSigner } = useNDKContext();
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [nAddresses, setNAddresses] = useState({});
  const [nsec, setNsec] = useState(null);
  const [npub, setNpub] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [nAddress, setNAddress] = useState(null);
  const windowWidth = useWindowWidth();
  const isMobileView = windowWidth <= 968;
  const [activeTab, setActiveTab] = useState('overview'); // Default to overview tab
  const navbarHeight = 60; // Match the height from Navbar component

  useEffect(() => {
    if (router.isReady && router.query.slug) {
      const { slug } = router.query;
      if (slug.includes('naddr')) {
        setNAddress(slug);
      } else {
        console.warn('No naddress found in slug');
        showToast('error', 'Error', 'Course identifier not found in URL');
        setTimeout(() => {
          router.push('/courses'); // Redirect to courses page
        }, 3000);
      }
    }
  }, [router.isReady, router.query.slug, showToast, router]);

  useEffect(() => {
    if (router.isReady) {
      const { active } = router.query;
      if (active !== undefined) {
        setActiveIndex(parseInt(active, 10));
        // If we have an active lesson, switch to content tab
        setActiveTab('content');
      } else {
        setActiveIndex(0);
        // Default to overview tab when no active parameter
        setActiveTab('overview');
      }

      // Auto-open sidebar on desktop, close on mobile
      setSidebarVisible(!isMobileView);
    }
  }, [router.isReady, router.query, isMobileView]);

  const setCompleted = useCallback(lessonId => {
    setCompletedLessons(prev => [...prev, lessonId]);
  }, []);

  const fetchAuthor = useCallback(
    async pubkey => {
      const author = await ndk.getUser({ pubkey });
      const profile = await author.fetchProfile();
      const fields = await findKind0Fields(profile);
      return fields;
    },
    [ndk]
  );

  const {
    course,
    lessonIds,
    paidCourse,
    loading: courseLoading,
  } = useCourseData(ndk, fetchAuthor, router);
  
  const { lessons, uniqueLessons, setLessons } = useLessons(
    ndk,
    fetchAuthor,
    lessonIds,
    course?.pubkey
  );
  
  const { decryptionPerformed, loading: decryptionLoading } = useDecryption(
    session,
    paidCourse,
    course,
    lessons,
    setLessons
  );

  useEffect(() => {
    if (uniqueLessons.length > 0) {
      const addresses = {};
      uniqueLessons.forEach(lesson => {
        const addr = nip19.naddrEncode({
          pubkey: lesson.pubkey,
          kind: lesson.kind,
          identifier: lesson.d,
          relays: appConfig.defaultRelayUrls,
        });
        addresses[lesson.id] = addr;
      });
      setNAddresses(addresses);
    }
  }, [uniqueLessons]);

  useEffect(() => {
    if (session?.user?.privkey) {
      const privkeyBuffer = Buffer.from(session.user.privkey, 'hex');
      setNsec(nip19.nsecEncode(privkeyBuffer));
      setNpub(null);
    } else if (session?.user?.pubkey) {
      setNsec(null);
      setNpub(nip19.npubEncode(session.user.pubkey));
    } else {
      setNsec(null);
      setNpub(null);
    }
  }, [session]);

  const isAuthorized = 
    session?.user?.role?.subscribed || 
    session?.user?.pubkey === course?.pubkey || 
    !paidCourse || 
    session?.user?.purchased?.some(purchase => purchase.courseId === course?.d)

  const handleLessonSelect = index => {
    setActiveIndex(index);
    router.push(`/course/${router.query.slug}?active=${index}`, undefined, { shallow: true });

    // On mobile, switch to content tab after selection
    if (isMobileView) {
      setActiveTab('content');
      setSidebarVisible(false);
    }
  };

  const handlePaymentSuccess = async response => {
    if (response && response?.preimage) {
      const updated = await update();
      showToast('success', 'Payment Success', 'You have successfully purchased this course');
    } else {
      showToast('error', 'Error', 'Failed to purchase course. Please try again.');
    }
  };

  const handlePaymentError = error => {
    showToast(
      'error',
      'Payment Error',
      `Failed to purchase course. Please try again. Error: ${error}`
    );
  };

  const toggleTab = (index) => {
    const tabMap = ['overview', 'content', 'qa'];
    // If mobile and we have the lessons tab, insert it at index 2
    if (isMobileView) {
      tabMap.splice(2, 0, 'lessons');
    }
    
    const tabName = tabMap[index];
    setActiveTab(tabName);
    
    // Only show/hide sidebar on mobile - desktop keeps sidebar visible
    if (isMobileView) {
      if (tabName === 'lessons') {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    }
  };

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Map active tab name back to index for MenuTab
  const getActiveTabIndex = () => {
    const tabMap = ['overview', 'content', 'qa'];
    if (isMobileView) {
      tabMap.splice(2, 0, 'lessons');
    }
    
    return tabMap.indexOf(activeTab);
  };

  // Create tab items for MenuTab
  const getTabItems = () => {
    const items = [
      {
        label: 'Overview',
        icon: 'pi pi-home',
      },
      {
        label: 'Content',
        icon: 'pi pi-book',
      }
    ];
    
    // Add lessons tab only on mobile
    if (isMobileView) {
      items.push({
        label: 'Lessons',
        icon: 'pi pi-list',
      });
    }
    
    items.push({
      label: 'Comments',
      icon: 'pi pi-comments',
    });
    
    return items;
  };

  // Add keyboard navigation support for tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        const currentIndex = getActiveTabIndex();
        const nextIndex = (currentIndex + 1) % getTabItems().length;
        toggleTab(nextIndex);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = getActiveTabIndex();
        const prevIndex = (currentIndex - 1 + getTabItems().length) % getTabItems().length;
        toggleTab(prevIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab]);

  // Render the QA section (empty for now)
  const renderQASection = () => {
    return (
      <div className="rounded-lg p-8 mt-4 bg-gray-800 max-mob:px-4">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {nAddress !== null && isAuthorized ? (
        <div className="px-4 max-mob:px-0">
          <ZapThreadsWrapper
            anchor={nAddress}
            user={nsec || npub || null}
            relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://relay.primal.net/, wss://nostrue.com/, wss://purplerelay.com/, wss://relay.devs.tools/"
            disable="zaps"
            isAuthorized={isAuthorized}
          />
        </div>
      ) : (
        <div className="text-center p-4 mx-4 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">
            Comments are only available to content purchasers, subscribers, and the content creator.
          </p>
        </div>
      )}
      </div>
    );
  };
  // Render Course Overview section
  const renderOverviewSection = () => {
    // Get isCompleted status for use in the component
    const isCompleted = completedLessons.length > 0;
    
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-800 shadow-md ${isMobileView ? 'p-4' : 'p-6'}`}>
        {isMobileView && course && (
          <div className="mb-2">
            {/* Completed tag above image in mobile view */}
            {isCompleted && (
              <div className="mb-2">
                <Tag severity="success" value="Completed" />
              </div>
            )}
            
            {/* Course image */}
            {course.image && (
              <div className="w-full h-48 relative rounded-lg overflow-hidden mb-3">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
        <CourseDetails
          processedEvent={course}
          paidCourse={paidCourse}
          lessons={uniqueLessons}
          decryptionPerformed={decryptionPerformed}
          handlePaymentSuccess={handlePaymentSuccess}
          handlePaymentError={handlePaymentError}
          isMobileView={isMobileView}
          showCompletedTag={!isMobileView}
        />
      </div>
    );
  };

  if (courseLoading || decryptionLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  const renderLesson = lesson => {
    if (lesson.topics?.includes('video') && lesson.topics?.includes('document')) {
      return (
        <CombinedLesson
          lesson={lesson}
          course={course}
          decryptionPerformed={decryptionPerformed}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
        
      );
    } else if (lesson.type === 'video' && !lesson.topics?.includes('document')) {
      return (
        <VideoLesson
          lesson={lesson}
          course={course}
          decryptionPerformed={decryptionPerformed}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
      );
    } else if (lesson.type === 'document' && !lesson.topics?.includes('video')) {
      return (
        <DocumentLesson
          lesson={lesson}
          course={course}
          decryptionPerformed={decryptionPerformed}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
      );
    }
  };

  return (
    <>
      <div className="mx-auto px-8 max-mob:px-0 mb-12 mt-4">
        {/* Tab navigation using MenuTab component */}
        <div className="z-10 bg-transparent border-b border-gray-700/30"
             style={{ 
               top: `${navbarHeight}px`,
               height: `${navbarHeight}px`
             }}> 
          <MenuTab 
            items={getTabItems()}
            activeIndex={getActiveTabIndex()}
            onTabChange={(index) => toggleTab(index)}
            sidebarVisible={sidebarVisible}
            onToggleSidebar={handleToggleSidebar}
            isMobileView={isMobileView}
          />
        </div>

        {/* Revised layout structure to prevent content flexing */}
        <div className="relative mt-4">
          {/* Main content area with fixed width */}
          <div className={`transition-all duration-500 ease-in-out ${isMobileView ? 'w-full' : 'w-full'}`} 
              style={!isMobileView && sidebarVisible ? {paddingRight: '320px'} : {}}>
            {/* Overview tab content */}
            <div className={`${activeTab === 'overview' ? 'block' : 'hidden'}`}>
              {renderOverviewSection()}
            </div>
            
            {/* Content tab content */}
            <div className={`${activeTab === 'content' ? 'block' : 'hidden'}`}>
              {uniqueLessons.length > 0 && uniqueLessons[activeIndex] ? (
                <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  {renderLesson(uniqueLessons[activeIndex])}
                </div>
              ) : (
                <div className="text-center bg-gray-800 rounded-lg p-8">
                  <p>Select a lesson from the sidebar to begin learning.</p>
                </div>
              )}

              {course?.content && (
                <div className="mt-8 bg-gray-800 rounded-lg shadow-sm">
                  <MarkdownDisplay content={course.content} className="p-4 rounded-lg" />
                </div>
              )}
            </div>

            {/* QA tab content */}
            <div className={`${activeTab === 'qa' ? 'block' : 'hidden'}`}>
              {renderQASection()}
            </div>
          </div>

          {/* Course Sidebar - positioned absolutely on desktop when visible */}
          {!isMobileView ? (
            <div 
              className={`transition-all duration-500 ease-in-out ${
                sidebarVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
              style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '320px',
                height: '100%',
                zIndex: 999,
                overflow: 'visible',
                pointerEvents: sidebarVisible ? 'auto' : 'none'
              }}
            >
              <CourseSidebar
                lessons={uniqueLessons}
                activeIndex={activeIndex}
                onLessonSelect={handleLessonSelect}
                completedLessons={completedLessons}
                isMobileView={isMobileView}
                sidebarVisible={sidebarVisible}
                setSidebarVisible={setSidebarVisible}
                hideToggleButton={true}
              />
            </div>
          ) : (
            <div className={`flex-shrink-0 transition-all duration-300 z-[999] ${
              (isMobileView && activeTab === 'lessons') ? 'ml-0 w-auto opacity-100' : 
              'w-0 ml-0 opacity-0 overflow-hidden'
            }`}>
              <CourseSidebar
                lessons={uniqueLessons}
                activeIndex={activeIndex}
                onLessonSelect={(index) => {
                  handleLessonSelect(index);
                  if (isMobileView) {
                    toggleTab(getTabItems().findIndex(item => item.label === 'Content'));
                  }
                }}
                completedLessons={completedLessons}
                isMobileView={isMobileView}
                onClose={() => {
                  setSidebarVisible(false);
                  setActiveTab('content');
                }}
                sidebarVisible={sidebarVisible}
                setSidebarVisible={setSidebarVisible}
                hideToggleButton={true}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Course;
