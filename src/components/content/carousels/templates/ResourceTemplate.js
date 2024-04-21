import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import useResponsiveImageDimensions from "@/hooks/useResponsiveImageDimensions";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useNostr } from "@/hooks/useNostr";
import { getSatAmountFromInvoice } from "@/utils/lightning";

const ResourceTemplate = (resource) => {
    const [zaps, setZaps] = useState([]);
    const [zapAmount, setZapAmount] = useState(null);
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();
    const { width, height } = useResponsiveImageDimensions();

    const { fetchZapsForEvent } = useNostr();

    useEffect(() => {
        const fetchZaps = async () => {
            try {
                const zaps = await fetchZapsForEvent(resource.id);
                setZaps(zaps);
            } catch (error) {
                console.error('Error fetching zaps:', error);
            }
        };
        fetchZaps();
    }, [fetchZapsForEvent, resource]);

    useEffect(() => {
        if (zaps.length > 0) {
            zaps.map((zap) => {
                const bolt11Tag = zap.tags.find(tag => tag[0] === 'bolt11');
                const invoice = bolt11Tag ? bolt11Tag[1] : null;

                if (invoice) {
                    const amount = getSatAmountFromInvoice(invoice);
                    setZapAmount(zapAmount + amount);
                }
            })
        }
    }, [zaps]);

    return (
        <div style={{ width: width < 768 ? "auto" : width }} onClick={() => router.push(`/details/${resource.id}`)} className="flex flex-col items-center mx-auto px-4 cursor-pointer mt-8 rounded-md">
            <div style={{ maxWidth: width, minWidth: width }} className="max-tab:h-auto max-mob:h-auto">
                <Image
                    alt="resource thumbnail"
                    src={returnImageProxy(resource.image)}
                    quality={100}
                    width={width}
                    height={height}
                    className="w-full object-cover object-center rounded-md"
                />
                <div className='flex flex-col justify-start min-h-max'>
                    <h4 className="mb-1 font-bold text-2xl font-blinker">{resource.title}</h4>
                    <div style={{ height: '90px', display: 'flex', alignItems: 'flex-start' }}>
                        <p style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                            font: '400 1rem/1.5 Blinker, sans-serif',
                            flexGrow: 1
                        }}>
                            {resource.summary}
                        </p>
                    </div>
                    <div className="flex flex-row justify-between w-full">
                        <p className="text-sm mt-1 text-gray-400">Published: {formatTimestampToHowLongAgo(resource.published_at)}</p>
                        <p className="pr-2"><i className="pi pi-bolt"></i> {zapAmount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceTemplate;