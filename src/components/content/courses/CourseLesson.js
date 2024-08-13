import React, { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import Image from "next/image";
import { useImageProxy } from "@/hooks/useImageProxy";
import { getTotalFromZaps } from "@/utils/lightning";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import dynamic from "next/dynamic";
import { useZapsQuery } from "@/hooks/nostrQueries/zaps/useZapsQuery";

const BitcoinConnectPayButton = dynamic(
    () => import('@getalby/bitcoin-connect-react').then((mod) => mod.PayButton),
    {
        ssr: false,
    }
);

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

const CourseLesson = ({ lesson, course }) => {
    const [bitcoinConnect, setBitcoinConnect] = useState(false);
    const [zapAmount, setZapAmount] = useState(0);

    const { zaps, zapsLoading, zapsError } = useZapsQuery({ event: lesson, type: "lesson" });
    const { returnImageProxy } = useImageProxy();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const bitcoinConnectConfig = window.localStorage.getItem('bc:config');

        if (bitcoinConnectConfig) {
            setBitcoinConnect(true);
        }
    }, []);

    const handleZapEvent = async () => {
        return;
    }

    useEffect(() => {
        if (!zaps || zapsLoading || zapsError) return;

        const total = getTotalFromZaps(zaps, lesson);

        setZapAmount(total);
    }, [zaps, zapsLoading, zapsError, lesson]);

    return (
        <div className='w-full px-24 pt-12 mx-auto mt-4 max-tab:px-0 max-mob:px-0 max-tab:pt-2 max-mob:pt-2'>
            <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
                <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[95vw] max-mob:w-[95vw]'>
                    <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                        <div className='pt-2 flex flex-row justify-start w-full'>
                            {lesson && lesson.topics && lesson.topics.length > 0 && (
                                lesson.topics.map((topic, index) => (
                                    <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                                ))
                            )}
                        </div>
                        <h1 className='text-4xl mt-6'>{lesson?.title}</h1>
                        <p className='text-xl mt-6'>{lesson?.summary}</p>
                        <div className='flex flex-row w-full mt-6 items-center'>
                            <Image
                                alt="avatar thumbnail"
                                src={returnImageProxy(lesson.author?.avatar, lesson.author?.pubkey)}
                                width={50}
                                height={50}
                                className="rounded-full mr-4"
                            />
                            <p className='text-lg'>
                                Created by{' '}
                                <a rel='noreferrer noopener' target='_blank' className='text-blue-500 hover:underline'>
                                    {lesson.author?.username || lesson.author?.name || lesson.author?.pubkey}
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-col max-tab:mt-12 max-mob:mt-12'>
                        {lesson && (
                            <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md'>
                                <Image
                                    alt="resource thumbnail"
                                    src={returnImageProxy(lesson.image)}
                                    width={344}
                                    height={194}
                                    className="w-[344px] h-[194px] object-cover object-top rounded-lg"
                                />
                                {bitcoinConnect ? (
                                    <div>
                                        <BitcoinConnectPayButton onClick={handleZapEvent} />
                                    </div>
                                ) : (
                                    <div className="w-full flex justify-end">
                                        <ZapDisplay zapAmount={zapAmount} event={lesson} zapsLoading={zapsLoading} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {
                    lesson?.content && <MDDisplay source={lesson.content} />
                }
            </div>
        </div>
    )
}

export default CourseLesson;
