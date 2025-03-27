import React from "react";
import Image from "next/image";
import { useImageProxy } from "@/hooks/useImageProxy";
import { formatUnixTimestamp } from "@/utils/time";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import GenericButton from "@/components/buttons/GenericButton";
import useWindowWidth from "@/hooks/useWindowWidth";
import { BookOpen } from "lucide-react";

const ContentDropdownItem = ({ content, onSelect }) => {
    const { returnImageProxy } = useImageProxy();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth <= 600;

    return (
        <div 
            className="px-6 py-6 border-b border-gray-700 cursor-pointer" 
            onClick={() => onSelect(content)}
        >
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
                <div className={`relative ${isMobile ? 'w-full h-40' : 'w-[160px] h-[90px]'} flex-shrink-0 overflow-hidden rounded-md`}>
                    <Image
                        alt="content thumbnail"
                        src={returnImageProxy(content?.image)}
                        width={isMobile ? 600 : 160}
                        height={isMobile ? 240 : 90}
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-foreground/50 opacity-60" />
                    <div className="absolute bottom-2 left-2 flex gap-2">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-[#f8f8ff]">{content?.title || content?.name}</h3>
                        
                        {content?.price > 0 ? (
                            <Message severity="info" text={`${content.price} sats`} className="py-1 text-xs whitespace-nowrap" />
                        ) : (
                            <Message severity="success" text="Free" className="py-1 text-xs whitespace-nowrap" />
                        )}
                    </div>
                    
                    {content?.summary && (
                        <p className="text-neutral-50/90 line-clamp-2 mb-3 text-sm">{content.summary}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                        {content?.topics?.map((topic) => (
                            <Tag key={topic} value={topic} className="px-2 py-1 text-sm text-[#f8f8ff]" />
                        ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                        <div className="text-sm text-gray-300">
                            {(content?.published_at || content?.created_at) 
                                ? `Published: ${formatUnixTimestamp(content?.published_at || content?.created_at)}` 
                                : "Not yet published"}
                        </div>
                        
                        {!isMobile && (
                            <GenericButton 
                                outlined 
                                size="small" 
                                label="Start Learning" 
                                icon="pi pi-chevron-right"
                                iconPos="right"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(content);
                                }} 
                                className="items-center py-1" 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentDropdownItem;