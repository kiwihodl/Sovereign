import React, { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import GenericButton from "@/components/buttons/GenericButton";
import Image from "next/image";
import { useImageProxy } from "@/hooks/useImageProxy";
import { formatDateTime, formatUnixTimestamp } from "@/utils/time";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

const DraftCourseLesson = ({ lesson, course }) => {
    const [isPublished, setIsPublished] = useState(false);

    const router = useRouter();
    const { returnImageProxy } = useImageProxy();

    useEffect(() => {
        if (lesson?.kind) {
            console.log(lesson);
            setIsPublished(true);
        } else {
            setIsPublished(false);
        }
    }, [lesson]);

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
                        {lesson?.additionalLinks && lesson.additionalLinks.length > 0 && (
                            <div className='mt-6'>
                                <h3 className='text-lg font-semibold mb-2'>External links:</h3>
                                <ul className='list-disc list-inside'>
                                    {lesson.additionalLinks.map((link, index) => (
                                        <li key={index}>
                                            <a href={link} target="_blank" rel="noopener noreferrer" className='text-blue-500 hover:underline'>
                                                {new URL(link).hostname}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {lesson?.price && (
                            <p className='text-lg mt-6'>Price: {lesson.price} sats</p>
                        )}
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
                        {
                            lesson?.createdAt ? (
                                <p className="pt-8 text-sm text-gray-400">{formatDateTime(lesson?.createdAt)}</p>
                            ) : (
                                <p className="pt-8 text-sm text-gray-400">{formatUnixTimestamp(lesson?.published_at)}</p>
                            )
                        }
                        <div className='flex flex-row w-full mt-6 items-center'>
                            {isPublished ? (
                                <>
                                    <Message severity="success" text="published" className="w-auto m-2" />
                                    <GenericButton onClick={() => router.push(`/details/${lesson.id}`)} label="View" outlined className="w-auto m-2" />
                                    <GenericButton onClick={() => router.push(`/details/${lesson.id}/edit`)} label="Edit" severity='warning' outlined className="w-auto m-2" />
                                </>
                            ) : (
                                <>
                                    <Message severity="info" text="draft (unpublished)" />
                                    <GenericButton onClick={() => router.push(`/draft/${lesson.id}`)} label="View" outlined className="w-auto m-2" />
                                    <GenericButton onClick={() => router.push(`/draft/${lesson.id}/edit`)} label="Edit" severity='warning' outlined className="w-auto m-2" />
                                </>
                            )}
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
                                    className="w-[344px] h-full object-cover object-top rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {
                    lesson?.content && <MDDisplay className='p-4 rounded-lg' source={lesson.content} />
                }
            </div>
        </div>
    )
}

export default DraftCourseLesson;
