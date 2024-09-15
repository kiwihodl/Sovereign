import React, { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import Image from "next/image";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import { useImageProxy } from "@/hooks/useImageProxy";
import GenericButton from "@/components/buttons/GenericButton";
import { useZapsQuery } from "@/hooks/nostrQueries/zaps/useZapsQuery";
import { nip19 } from "nostr-tools";
import { getTotalFromZaps } from "@/utils/lightning";
import dynamic from "next/dynamic";
import { Divider } from "primereact/divider";
import { defaultRelayUrls } from "@/context/NDKContext";
import useWindowWidth from "@/hooks/useWindowWidth";

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

const VideoLesson = ({ lesson, course, decryptionPerformed, isPaid }) => {
    const [zapAmount, setZapAmount] = useState(0);
    const [nAddress, setNAddress] = useState(null);
    const { zaps, zapsLoading, zapsError } = useZapsQuery({ event: lesson, type: "lesson" });
    const { returnImageProxy } = useImageProxy();
    const windowWidth = useWindowWidth();
    const isMobileView = windowWidth <= 768;

    useEffect(() => {
        if (!zaps || zapsLoading || zapsError) return;
        const total = getTotalFromZaps(zaps, lesson);
        setZapAmount(total);
    }, [zaps, zapsLoading, zapsError, lesson]);

    useEffect(() => {
        const addr = nip19.naddrEncode({
            pubkey: lesson.pubkey,
            kind: lesson.kind,
            identifier: lesson.d,
            relayUrls: defaultRelayUrls
        });
        setNAddress(addr);
    }, [lesson]);

    const renderContent = () => {
        if (isPaid && decryptionPerformed) {
            return (
                <>
                    <div className="w-full aspect-video rounded-lg mb-4">
                        {/* Add your video player component here */}
                        <video controls className="w-full h-full">
                            <source src={lesson.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <MDDisplay className='p-4 rounded-lg w-full' source={lesson.content} />
                </>
            );
        }
        if (isPaid && !decryptionPerformed) {
            return (
                <div className="w-full aspect-video rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <div 
                        className="absolute inset-0 opacity-50"
                        style={{
                            backgroundImage: `url(${lesson.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className="mx-auto py-auto z-10">
                        <i className="pi pi-lock text-[100px] text-red-500"></i>
                    </div>
                    <p className="text-center text-xl text-red-500 z-10 mt-4">
                        This content is paid and needs to be purchased before viewing.
                    </p>
                </div>
            );
        }
        if (lesson?.content) {
            return <MDDisplay className='p-4 rounded-lg w-full' source={lesson.content} />;
        }
        return null;
    }

    return (
        <div className="w-full">
            {renderContent()}
            <Divider />
            <div className="bg-gray-800/90 rounded-lg p-4 m-4">
                <div className="w-full flex flex-col items-start justify-start mt-2 px-2">
                    <div className="flex flex-row items-center gap-2 w-full">
                        <h1 className='text-3xl text-white'>{lesson.title}</h1>
                        {lesson.topics && lesson.topics.length > 0 && (
                            lesson.topics.map((topic, index) => (
                                <Tag className='mt-2 text-white' key={index} value={topic}></Tag>
                            ))
                        )}
                    </div>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <p className='text-xl mt-4 text-gray-200'>{lesson.summary && (
                        <div className="text-xl mt-4">
                            {lesson.summary.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    )}
                    </p>
                        <ZapDisplay
                            zapAmount={zapAmount}
                            event={lesson}
                            zapsLoading={zapsLoading}
                        />
                    </div>
                </div>
                <div className='w-full flex flex-col space-y-4 mt-4'>
                    <div className='flex flex-row justify-between items-center'>
                        <div className='flex flex-row w-fit items-center'>
                            <Image
                                alt="avatar image"
                                src={returnImageProxy(lesson.author?.avatar, lesson.author?.username)}
                                width={50}
                                height={50}
                                className="rounded-full mr-4"
                            />
                            <p className='text-lg text-white'>
                                Created by{' '}
                                <a rel='noreferrer noopener' target='_blank' className='text-blue-300 hover:underline'>
                                    {lesson.author?.username || lesson.author?.name || lesson.author?.pubkey}
                                </a>
                            </p>
                        </div>
                        <GenericButton
                            tooltip={isMobileView ? null : "View Nostr Note"}
                            tooltipOptions={{ position: 'left' }}
                            icon="pi pi-external-link"
                            outlined
                            onClick={() => {
                                window.open(`https://nostr.com/${nAddress}`, '_blank');
                            }}
                        />
                    </div>
                </div>
                {lesson?.additionalLinks && lesson.additionalLinks.length > 0 && (
                    <div className='mt-6'>
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
        </div>
    )
}

export default VideoLesson;