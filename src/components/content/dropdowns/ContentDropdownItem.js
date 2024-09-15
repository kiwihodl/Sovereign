import React, {useEffect} from "react";
import Image from "next/image";
import { useImageProxy } from "@/hooks/useImageProxy";
import { formatUnixTimestamp } from "@/utils/time";
import { Tag } from "primereact/tag";
import GenericButton from "@/components/buttons/GenericButton";

const ContentDropdownItem = ({ content, onSelect }) => {
    const { returnImageProxy } = useImageProxy();

    return (
        <div className="w-full border-t-2 border-gray-700 py-4">
            <div className="flex flex-row gap-4 p-2">
                <Image
                    alt="content thumbnail"
                    src={returnImageProxy(content?.image)}
                    width={50}
                    height={50}
                    className="w-[100px] h-[100px] object-cover object-center border-round"
                />
                <div className="flex-1 max-w-[80vw]">
                    <div className="text-lg text-900 font-bold">{content.title || content.name}</div>
                    <div className="w-full text-sm text-600 text-wrap line-clamp-2">{content.summary || content.description && (
                        <div className="text-xl mt-4">
                            {content.summary.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    )}
                    </div>
                    {content.price && <div className="text-sm pt-6 text-gray-500">Price: {content.price}</div>}
                    {content?.topics?.length > 0 && (
                        <div className="text-sm pt-6 text-gray-500">
                            {content.topics.map((topic) => (
                                <Tag key={topic} value={topic} size="small" className="mr-2 text-[#f8f8ff]" />
                            ))}
                        </div>
                    )}
                    <div className="text-sm pt-6 text-gray-500">
                    {(content.published_at || content.created_at) ? `Published: ${formatUnixTimestamp(content.published_at || content.created_at)}` : "not yet published"}
                    </div>
                </div>
                <div className="flex flex-col justify-end">
                    <GenericButton outlined size="small" label="Select" onClick={() => onSelect(content)} className="py-2" />
                </div>
            </div>
        </div>
    );
};

export default ContentDropdownItem;