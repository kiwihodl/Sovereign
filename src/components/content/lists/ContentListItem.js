import React, {useEffect} from "react";
import Image from "next/image";
import { Button } from "primereact/button";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useRouter } from "next/router";

const ContentListItem = (content) => {
    const { returnImageProxy } = useImageProxy();
    const router = useRouter();
    const isDraft = Object.keys(content).includes('type');
    const isCourse = content && content?.kind === 30004;

    useEffect(() => {
        if (content && content?.kind === 30004) {
            console.log("isDraft", isDraft);
            console.log("content", content);
            console.log("isCourse", isCourse);
        }
    }, [content, isDraft, isCourse]);

    const handleClick = () => {
        let path = '';
    
        if (isDraft) {
            path = '/draft';
        } else if (isCourse) {
            path = '/course';
        } else {
            path = '/details';
        }
    
        // const draftSuffix = isCourse ? '/draft' : '';
        const fullPath = `${path}/${content.id}`;
    
        router.push(fullPath);
    };
    

    return (
        <div className="p-4 border-bottom-1 surface-border" key={content.id}>
            <div className="flex flex-column md:flex-row gap-4">
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
        </div>
    );
};

export default ContentListItem;