import React, { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import Image from "next/image";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useZapsQuery } from "@/hooks/nostrQueries/zaps/useZapsQuery";
import GenericButton from "@/components/buttons/GenericButton";
import { nip19 } from "nostr-tools";
import { Divider } from "primereact/divider";
import { getTotalFromZaps } from "@/utils/lightning";
import dynamic from "next/dynamic";
import useWindowWidth from "@/hooks/useWindowWidth";
import appConfig from "@/config/appConfig";
import useTrackDocumentLesson from "@/hooks/tracking/useTrackDocumentLesson";

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

const DocumentLesson = ({ lesson, course, decryptionPerformed, isPaid, setCompleted }) => {
    const [zapAmount, setZapAmount] = useState(0);
    const [nAddress, setNAddress] = useState(null);
    const { zaps, zapsLoading, zapsError } = useZapsQuery({ event: lesson, type: "lesson" });
    const { returnImageProxy } = useImageProxy();
    const windowWidth = useWindowWidth();
    const isMobileView = windowWidth <= 768;
    // todo implement real read time needs to be on form
    const readTime = 30;

    const { isCompleted, isTracking } = useTrackDocumentLesson({
        lessonId: lesson?.d,
        courseId: course?.d,
        readTime: readTime,
        paidCourse: isPaid,
        decryptionPerformed: decryptionPerformed,
    });

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
                relayUrls: appConfig.defaultRelayUrls
            })
            setNAddress(addr);
        }
    }, [lesson]);

    useEffect(() => {
        if (isCompleted && !isTracking) {
            setCompleted(lesson.id);
        }
    }, [isCompleted, lesson.id, setCompleted, isTracking]);

    const renderContent = () => {
        if (isPaid && decryptionPerformed) {
            return <MDDisplay className='p-2 rounded-lg w-full' source={lesson.content} />;
        }
        if (isPaid && !decryptionPerformed) {
            return (
                <div className="w-full p-8 rounded-lg flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="mx-auto py-auto">
                        <i className="pi pi-lock text-[60px] text-red-500"></i>
                    </div>
                    <p className="text-center text-xl text-red-500 mt-4">
                        This content is paid and needs to be purchased before viewing.
                    </p>
                </div>
            );
        }
        if (lesson?.content) {
            return <MDDisplay className='p-2 rounded-lg w-full' source={lesson.content} />;
        }
        return null;
    }

    return (
        <div className="w-full">
            <div className="relative w-[80%] h-[200px] mx-auto mb-24">
                <Image
                    alt="lesson background image"
                    src={returnImageProxy(lesson.image)}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
            <div className="w-full mx-auto px-4 py-8 -mt-32 relative z-10">
                <div className="mb-8 bg-gray-800/70 rounded-lg p-4">
                    <div className="flex flex-row items-center justify-between w-full">
                        <h1 className='text-3xl font-bold text-white'>{lesson.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            {lesson.topics && lesson.topics.length > 0 && (
                                lesson.topics.map((topic, index) => (
                                    <Tag className='text-white' key={index} value={topic}></Tag>
                                ))
                            )}
                        </div>
                    </div>
                    <div className='text-xl text-gray-200 mb-4 mt-4'>{lesson.summary && (
                        <div className="text-xl mt-4">
                            {lesson.summary.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    )}
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                            <Image
                                alt="avatar image"
                                src={returnImageProxy(lesson.author?.avatar, lesson.author?.username)}
                                width={50}
                                height={50}
                                className="rounded-full mr-4"
                            />
                            <p className='text-lg text-white'>
                                By{' '}
                                <a rel='noreferrer noopener' target='_blank' className='text-blue-300 hover:underline'>
                                    {lesson.author?.username || lesson.author?.name || lesson.author?.pubkey}
                                </a>
                            </p>
                        </div>
                        <ZapDisplay
                            zapAmount={zapAmount}
                            event={lesson}
                            zapsLoading={zapsLoading}
                        />
                    </div>
                    <div className="w-full flex flex-row justify-end">
                        <GenericButton
                            tooltip={isMobileView ? null : "View Nostr Note"}
                            tooltipOptions={{ position: 'left' }}
                            icon="pi pi-external-link"
                            outlined
                            onClick={() => {
                                window.open(`https://habla.news/a/${nAddress}`, '_blank');
                            }}
                        />
                    </div>
                </div>
                <Divider />
            {lesson?.additionalLinks && lesson.additionalLinks.length > 0 && (
                <div className='mt-6 bg-gray-800/90 rounded-lg p-4'>
                    <h3 className='text-lg font-semibold mb-2 text-white'>External links:</h3>
                    <ul className='list-disc list-inside text-white'>
                        {lesson.additionalLinks.map((link, index) => (
                            <li key={index}>
                                <a href={link} target="_blank" rel="noopener noreferrer" className='text-blue-300 hover:underline'>
                                    {new URL(link).hostname}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </div>
            {renderContent()}
        </div>
    )
}

export default DocumentLesson;