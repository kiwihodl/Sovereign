import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { useImageProxy } from "@/hooks/useImageProxy";
import { getTotalFromZaps } from "@/utils/lightning";
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import { Tag } from "primereact/tag";

const WorkshopTemplate = ({ workshop }) => {
    const [zapAmount, setZapAmount] = useState(null);
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: workshop });

    useEffect(() => {
        if (zapsLoading || !zaps) return;

        const total = getTotalFromZaps(zaps, workshop);

        setZapAmount(total);
    }, [zaps, workshop, zapsLoading, zapsError]);

    if (zapsError) return <div>Error: {zapsError}</div>;

    return (
        <div className="flex flex-col items-center mx-auto px-4 mt-8 rounded-md">
            {/* Wrap the image in a div with a relative class with a padding-bottom of 56.25% representing the aspect ratio of 16:9 */}
            <div
                onClick={() => router.push(`/details/${workshop.id}`)}
                className="relative w-full h-0 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                style={{ paddingBottom: "56.25%" }}
            >
                <Image
                    alt="workshop thumbnail"
                    src={returnImageProxy(workshop.image)}
                    quality={100}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                />
            </div>
            <div className="flex flex-col justify-start w-full mt-4">
                <h4 className="mb-1 font-bold text-lg font-blinker line-clamp-2">
                    {workshop.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">{workshop.summary}</p>
                {workshop.price && workshop.price > 0 ? (
                    <p className="text-sm text-gray-500 line-clamp-2">Price: {workshop.price} sats</p>
                ) : (                    
                    <p className="text-sm text-gray-500 line-clamp-2">Free</p>
                )}
                <div className="flex flex-row justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                        {formatTimestampToHowLongAgo(workshop.published_at)}
                    </p>
                    <ZapDisplay zapAmount={zapAmount} event={workshop} zapsLoading={zapsLoading} />
                </div>
                {workshop?.topics && workshop?.topics.length > 0 && (
                    <div className="flex flex-row justify-start items-center mt-2">
                        {workshop.topics.map((topic, index) => (
                            <Tag key={index} value={topic} className="mr-2 text-white" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkshopTemplate;
