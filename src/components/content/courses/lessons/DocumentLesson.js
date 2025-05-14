import React, { useEffect, useState, useRef } from 'react';
import { Tag } from 'primereact/tag';
import Image from 'next/image';
import ZapDisplay from '@/components/zaps/ZapDisplay';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useZapsQuery } from '@/hooks/nostrQueries/zaps/useZapsQuery';
import { nip19 } from 'nostr-tools';
import { Divider } from 'primereact/divider';
import { getTotalFromZaps } from '@/utils/lightning';
import useWindowWidth from '@/hooks/useWindowWidth';
import appConfig from '@/config/appConfig';
import useTrackDocumentLesson from '@/hooks/tracking/useTrackDocumentLesson';
import { Toast } from 'primereact/toast';
import MoreOptionsMenu from '@/components/ui/MoreOptionsMenu';
import { useSession } from 'next-auth/react';
import MarkdownDisplay from '@/components/markdown/MarkdownDisplay';

const DocumentLesson = ({ lesson, course, decryptionPerformed, isPaid, setCompleted }) => {
  const [zapAmount, setZapAmount] = useState(0);
  const [nAddress, setNAddress] = useState(null);
  const { zaps, zapsLoading, zapsError } = useZapsQuery({ event: lesson, type: 'lesson' });
  const { returnImageProxy } = useImageProxy();
  const windowWidth = useWindowWidth();
  const isMobileView = windowWidth <= 768;
  const menuRef = useRef(null);
  const toastRef = useRef(null);
  // todo implement real read time needs to be on form
  const readTime = 120;
  const { data: session } = useSession();

  const { isCompleted, isTracking, markLessonAsCompleted } = useTrackDocumentLesson({
    lessonId: lesson?.d,
    courseId: course?.d,
    readTime: readTime,
    paidCourse: isPaid,
    decryptionPerformed: decryptionPerformed,
  });

  const buildMenuItems = () => {
    const items = [];

    const hasAccess =
      session?.user && (!isPaid || decryptionPerformed || session.user.role?.subscribed);

    if (hasAccess) {
      items.push({
        label: 'Mark as completed',
        icon: 'pi pi-check-circle',
        command: async () => {
          try {
            await markLessonAsCompleted();
            setCompleted && setCompleted(lesson.id);
            toastRef.current.show({
              severity: 'success',
              summary: 'Success',
              detail: 'Lesson marked as completed',
              life: 3000,
            });
          } catch (error) {
            console.error('Failed to mark lesson as completed:', error);
            toastRef.current.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to mark lesson as completed',
              life: 3000,
            });
          }
        },
      });
    }

    items.push({
      label: 'Open lesson',
      icon: 'pi pi-arrow-up-right',
      command: () => {
        window.open(`/details/${lesson.id}`, '_blank');
      },
    });

    items.push({
      label: 'View Nostr note',
      icon: 'pi pi-globe',
      command: () => {
        window.open(`https://habla.news/a/${nAddress}`, '_blank');
      },
    });

    return items;
  };

  useEffect(() => {
    if (!zaps || zapsLoading || zapsError) return;
    const total = getTotalFromZaps(zaps, lesson);
    setZapAmount(total);
  }, [zaps, zapsLoading, zapsError, lesson]);

  useEffect(() => {
    if (lesson) {
      const addr = nip19.naddrEncode({
        pubkey: lesson.pubkey,
        kind: lesson.kind,
        identifier: lesson.d,
        relays: appConfig.defaultRelayUrls,
      });
      setNAddress(addr);
    }
  }, [lesson]);

  useEffect(() => {
    if (isCompleted && !isTracking) {
      setCompleted(lesson.id);
    }
  }, [isCompleted, lesson.id, setCompleted, isTracking]);

  const renderContent = () => {
    if (!lesson?.content) {
      return (
        <div className="w-full p-8 rounded-lg flex flex-col items-center justify-center bg-gray-800">
          <p className="text-center text-gray-400">No content available for this lesson.</p>
        </div>
      );
    }

    if (isPaid && !decryptionPerformed) {
      return (
        <div className="w-full p-8 rounded-lg flex flex-col items-center justify-center">
          <div className="mx-auto py-auto">
            <i className="pi pi-lock text-[60px] text-red-500"></i>
          </div>
          <p className="text-center text-xl text-red-500 mt-4">
            This content is paid and needs to be purchased before viewing.
          </p>
        </div>
      );
    }

    return <MarkdownDisplay content={lesson.content} className="p-4 rounded-lg w-full" />;
  };

  return (
    <div className="w-full">
      <Toast ref={toastRef} />
      <div className="relative w-[80%] h-[200px] mx-auto mb-24">
        <div className="relative w-full h-full mt-2 rounded-lg">
          <Image
            alt="lesson background image"
            src={returnImageProxy(lesson.image)}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="absolute inset-0 bg-gray-800 bg-opacity-20"></div>
      </div>
      <div className="w-full mx-auto px-4 py-8 -mt-32 relative z-10">
        <div className="mb-8 bg-gray-800/70 rounded-lg p-4">
          <div className="flex flex-row items-center justify-between w-full">
            <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
            <ZapDisplay zapAmount={zapAmount} event={lesson} zapsLoading={zapsLoading} />
          </div>
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {lesson.topics &&
              lesson.topics.length > 0 &&
              lesson.topics.map((topic, index) => (
                <Tag className="text-white" key={index} value={topic}></Tag>
              ))}
          </div>
          <div className="text-xl text-gray-200 mb-4 mt-4">
            {lesson.summary && (
              <div className="text-xl mt-4">
                {lesson.summary.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center">
              <Image
                alt="avatar image"
                src={returnImageProxy(lesson.author?.avatar, lesson.author?.username)}
                width={50}
                height={50}
                className="rounded-full mr-4"
              />
              <p className="text-lg text-white">
                By{' '}
                <a
                  rel="noreferrer noopener"
                  target="_blank"
                  className="text-blue-300 hover:underline"
                >
                  {lesson.author?.username || lesson.author?.pubkey}
                </a>
              </p>
            </div>
            <div className="flex justify-end">
              <MoreOptionsMenu
                menuItems={buildMenuItems()}
                additionalLinks={lesson?.additionalLinks || []}
                isMobileView={isMobileView}
              />
            </div>
          </div>
        </div>
        <Divider />
        {renderContent()}
      </div>
    </div>
  );
};

export default DocumentLesson;
