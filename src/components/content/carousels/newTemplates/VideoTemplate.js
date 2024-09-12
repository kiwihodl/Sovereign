import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"
import ZapDisplay from "@/components/zaps/ZapDisplay";
import Image from "next/image"
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";
import { getTotalFromZaps } from "@/utils/lightning";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useRouter } from "next/navigation";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { Tag } from "primereact/tag";
import GenericButton from "@/components/buttons/GenericButton";

export function VideoTemplate({ video }) {
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: video });
    const [zapAmount, setZapAmount] = useState(0);
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();

    useEffect(() => {
        if (zaps.length > 0) {
            const total = getTotalFromZaps(zaps, video);
            setZapAmount(total);
        }
    }, [zaps, video]);

    if (zapsError) return <div>Error: {zapsError}</div>;

    return (
        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-gray-800 m-2 border-none">
            <div className="relative h-48 sm:h-64">
                <Image
                    src={returnImageProxy(video.image)}
                    alt="Video thumbnail"
                    quality={100}
                    layout="fill"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-foreground/50" />
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 text-white px-3 py-1 rounded-full">
                    <ZapDisplay zapAmount={zapAmount} event={video} zapsLoading={zapsLoading && zapAmount === 0} />
                </div>
                <CardHeader className="absolute bottom-[-8px] left-0 right-0 text-white bg-gray-800/70 w-fit rounded-lg rounded-bl-none rounded-tl-none rounded-br-none p-4 max-w-[50%] max-h-[50%]">
                    <div className="flex items-start gap-4">
                        <PlayCircle className="w-10 h-10 mt-1 text-neutral-50 dark:text-neutral-900" />
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">{video.title}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
            </div>
            <CardContent className="pt-6 pb-2">
                <div className="flex flex-wrap gap-2">
                    {video?.topics?.map((topic, index) => (
                        <Tag key={index} className="px-3 py-1 text-sm text-[#f8f8ff]">
                            {topic}
                        </Tag>
                    ))}
                </div>
            </CardContent>
            <CardDescription className="p-6 py-2 text-base text-neutral-50/90 dark:text-neutral-900/90 overflow-hidden min-h-[4em] flex items-center"
                style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: "2"
                }}>
                {video.description || video.summary}
            </CardDescription>
            <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-300">{video?.published_at && video.published_at !== "" ? (
                    formatTimestampToHowLongAgo(video.published_at)
                ) : (
                    formatTimestampToHowLongAgo(video.created_at)
                )}</p>
                <GenericButton onClick={() => router.push(`/details/${video.id}`)} size="small" label="Watch" icon="pi pi-chevron-right" iconPos="right" outlined className="items-center py-2" />
            </CardFooter>
        </Card>
    )
}