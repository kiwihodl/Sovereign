import React from "react";
import Image from "next/image";
import { useImageProxy } from "@/hooks/useImageProxy";
import { Button } from "primereact/button";
import { formatUnixTimestamp } from "@/utils/time";

const ContentDropdownItem = ({ content, onSelect, selected }) => {
    const { returnImageProxy } = useImageProxy();

    if (selected) {
        return (
            <div className="w-full border-y-2 border-l-2 rounded-l-lg border-gray-700">
                <div className="flex flex-row gap-4 p-2">
                    <Image
                        alt="content thumbnail"
                        src={returnImageProxy(content.image)}
                        width={50}
                        height={50}
                        className="w-[100px] h-[100px] object-cover object-center border-round"
                    />
                    <div className="flex-1">
                        <div className="text-lg text-900 font-bold">{content.title}</div>
                        <div className="min-h-[40px] text-sm text-600 line-clamp-2 break-words">{content.summary}</div>
                        <div className="text-sm pt-6 text-gray-500">{content.published_at ? formatUnixTimestamp(content.published_at) : "not yet published"}</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full border-t-2 border-gray-700 py-4">
            <div className="flex flex-row gap-4 p-2">
                <Image
                    alt="content thumbnail"
                    src={returnImageProxy(content.image)}
                    width={50}
                    height={50}
                    className="w-[100px] h-[100px] object-cover object-center border-round"
                />
                <div className="flex-1 max-w-[80vw]">
                    <div className="text-lg text-900 font-bold">{content.title}</div>
                    <div className="w-full text-sm text-600 text-wrap">{content.summary}</div>
                    <div className="text-sm pt-6 text-gray-500">{content.published_at ? formatUnixTimestamp(content.published_at) : "not yet published"}</div>
                </div>
                <div className="flex flex-col justify-end">
                    <Button label="Select" onClick={() => onSelect(content)} />
                </div>
            </div>
        </div>
    );
};

export default ContentDropdownItem;