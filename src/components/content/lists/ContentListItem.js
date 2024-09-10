import React, {useEffect} from "react";
import Image from "next/image";
import { Button } from "primereact/button";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useRouter } from "next/router";
import { Divider } from 'primereact/divider';
        

const ContentListItem = (content) => {
    const { returnImageProxy } = useImageProxy();
    const router = useRouter();
    const isPublishedCourse = content?.kind === 30004;
    const isDraftCourse = !content?.kind && content?.draftLessons;
    const isResource = content?.kind && content?.kind === 30023;
    const isDraft = !content?.kind && !content?.draftLessons;

    const handleClick = () => {
        console.log(content);
        if (isPublishedCourse) {
            router.push(`/course/${content.id}`);
        } else if (isDraftCourse) {
            router.push(`/course/${content.id}/draft`);
        } else if (isResource) {
            router.push(`/details/${content.id}`);
        } else if (isDraft) {
            router.push(`/draft/${content.id}`);
        }
    };
    

    return (
        <div className="p-4 border-bottom-1 surface-border" key={content.id}>
            <div className="flex flex-column md:flex-row gap-4 max-tab:flex-col">
                <Image
                    alt="content thumbnail"
                    src={returnImageProxy(content.image)}
                    width={150}
                    height={100}
                    className="w-full md:w-[150px] h-[100px] object-cover object-center border-round"
                />
                <div className="flex-1">
                    <div className="text-xl text-900 font-bold mb-2">{content.title}</div>
                    <div className="flex align-items-center text-600 gap-2 mb-2">
                        <span>{content.summary}</span>
                    </div>
                    <div className="text-right">
                        <Button
                            onClick={handleClick}
                            label="Open"
                            outlined
                        />
                    </div>
                </div>
            </div>
            <Divider />
        </div>
    );
};

export default ContentListItem;