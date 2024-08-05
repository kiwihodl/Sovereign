import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useZapsQuery } from "@/hooks/nostrQueries/zaps/useZapsQuery";
import { getSatAmountFromInvoice } from "@/utils/lightning";
import ZapDisplay from "@/components/zaps/ZapDisplay";

const WorkshopTemplate = ({ workshop }) => {
    const [zapAmount, setZapAmount] = useState(null);
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();
    const { zaps, zapsLoading, zapsError } = useZapsQuery({ event: workshop, type: "workshop" });

    useEffect(() => {
        if (zapsLoading || !zaps) return;

        let total = 0;
        zaps.forEach((zap) => {
            // If the zap matches the event or the parameterized event, then add the zap to the total
            if (zap.tags.find(tag => tag[0] === "e" && tag[1] === workshop.id) || zap.tags.find(tag => tag[0] === "a" && tag[1] === `${workshop.kind}:${workshop.id}:${workshop.d}`)) {
                const bolt11Tag = zap.tags.find(tag => tag[0] === "bolt11");
                const invoice = bolt11Tag ? bolt11Tag[1] : null;
                if (invoice) {
                    const amount = getSatAmountFromInvoice(invoice);
                    total += amount;
                }
            }
        });

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
                <div className="flex flex-row justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                        {formatTimestampToHowLongAgo(workshop.published_at)}
                    </p>
                    <ZapDisplay zapAmount={zapAmount} event={workshop} zapsLoading={zapsLoading} />
                </div>
            </div>
        </div>
    );
};

export default WorkshopTemplate;
