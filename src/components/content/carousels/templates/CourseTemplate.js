import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useNostr } from "@/hooks/useNostr";
import { getSatAmountFromInvoice } from "@/utils/lightning";
import ZapDisplay from "@/components/zaps/ZapDisplay";

const CourseTemplate = (course) => {
    const [zaps, setZaps] = useState([]);
    const [zapAmount, setZapAmount] = useState(null);
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();
    const { fetchZapsForEvent } = useNostr();

    useEffect(() => {
        const fetchZaps = async () => {
            try {
                const zaps = await fetchZapsForEvent(course);
                // console.log('zaps:', zaps);
                if (zaps.length > 0) {
                    let total = 0;
                    zaps.map((zap) => {
                        const bolt11Tag = zap.tags.find((tag) => tag[0] === "bolt11");
                        const invoice = bolt11Tag ? bolt11Tag[1] : null;
                        if (invoice) {
                            const amount = getSatAmountFromInvoice(invoice);
                            total += amount;
                        }
                    });
                    setZapAmount(total);
                }
            } catch (error) {
                console.error("Error fetching zaps:", error);
            }
        };
        fetchZaps();
    }, [fetchZapsForEvent, course]);

    return (
        <div
            className="flex flex-col items-center mx-auto px-4 mt-8 rounded-md"
        >
            <div
                onClick={() => router.push(`/details/${course.id}`)}
                className="relative w-full h-0 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                style={{ paddingBottom: "56.25%" }}
            >
                <Image
                    alt="course thumbnail"
                    src={returnImageProxy(course.image)}
                    quality={100}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                />
            </div>
            <div className="flex flex-col justify-start w-full mt-4">
                <h4 className="mb-1 font-bold text-lg font-blinker line-clamp-2">
                    {course.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">{course.summary}</p>
                <div className="flex flex-row justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                        {formatTimestampToHowLongAgo(course.published_at)}
                    </p>
                    <ZapDisplay zapAmount={zapAmount} event={course} />
                </div>
            </div>
        </div>
    );
};

export default CourseTemplate;