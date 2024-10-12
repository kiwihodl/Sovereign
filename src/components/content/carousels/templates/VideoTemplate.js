import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"
import ZapDisplay from "@/components/zaps/ZapDisplay";
import Image from "next/image"
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";
import { getTotalFromZaps } from "@/utils/lightning";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useRouter } from "next/router";
import { nip19 } from "nostr-tools";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import GenericButton from "@/components/buttons/GenericButton";
import appConfig from "@/config/appConfig";

export function VideoTemplate({ video }) {
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: video });
    const [zapAmount, setZapAmount] = useState(0);
    const [nAddress, setNAddress] = useState(null);
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();

    useEffect(() => {
        if (video && video?.pubkey && video?.kind && video?.id) {
            const addr = nip19.naddrEncode({
                pubkey: video.pubkey,
                kind: video.kind,
                identifier: video.id,
                relayUrls: appConfig.defaultRelayUrls
            })
            setNAddress(addr);
        }
    }, [video]);

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
                    className={`${router.pathname === "/content" ? "w-full h-full object-cover" : "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-foreground/50" />
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 text-white px-3 py-1 rounded-full">
                    <ZapDisplay zapAmount={zapAmount} event={video} zapsLoading={zapsLoading && zapAmount === 0} />
                </div>
                <CardHeader className="absolute bottom-[-8px] left-0 right-0 text-white bg-gray-800/70 w-fit rounded-lg rounded-bl-none rounded-tl-none rounded-br-none p-4 max-w-[70%] max-h-[60%]">
                    <div className="flex items-center justify-center gap-4">
                        <i className="pi pi-video text-2xl text-[#f8f8ff]"></i>
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl mb-2">{video.title}</CardTitle>
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
                <p className="font-bold text-gray-300 min-w-[12%]">{video?.duration || "5 min"} watch</p>
            </CardContent>
            <CardDescription className="p-6 py-2 pt-0 text-base text-neutral-50/90 dark:text-neutral-900/90 overflow-hidden min-h-[4em] flex items-center"
                style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: "2"
                }}>
                <div className="w-full flex flex-row justify-between items-center">
                    {(video.summary || video.description)?.split('\n').map((line, index) => (
                        <span key={index}>{line}</span>
                    ))}
                    <div className="flex flex-col items-end">
                        {
                            video?.price && video?.price > 0 ? (
                                <Message className="py-2" icon="pi pi-lock" severity="info" text={`Price: ${video.price} sats`} />
                            ) : (
                                <Message className="py-2" icon="pi pi-lock-open" severity="success" text="Free" />
                            )
                        }
                    </div>
                </div>
            </CardDescription>
            <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-700 pt-4">
                <p className="text-sm text-gray-300">{video?.published_at && video.published_at !== "" ? (
                    formatTimestampToHowLongAgo(video.published_at)
                ) : (
                    formatTimestampToHowLongAgo(video.created_at)
                )}</p>
                <GenericButton onClick={() => router.push(`/details/${nAddress}`)} size="small" label="Watch" icon="pi pi-chevron-right" iconPos="right" outlined className="items-center py-2" />
            </CardFooter>
        </Card>
    )
}