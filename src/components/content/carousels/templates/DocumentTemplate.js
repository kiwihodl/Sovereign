import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ZapDisplay from "@/components/zaps/ZapDisplay";
import Image from "next/image"
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";
import { getTotalFromZaps } from "@/utils/lightning";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useRouter } from "next/router";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { nip19 } from "nostr-tools";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import useWindowWidth from "@/hooks/useWindowWidth";
import GenericButton from "@/components/buttons/GenericButton";
import appConfig from "@/config/appConfig";

export function DocumentTemplate({ document, isLesson, onZapAmountChange }) {
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: document });
    const [zapAmount, setZapAmount] = useState(0);
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    useEffect(() => {
        if (document && document?.id) {
            const nAddress = nip19.naddrEncode({
                pubkey: document.pubkey,
                kind: document.kind,
                identifier: document.id,
                relayUrls: appConfig.defaultRelayUrls
            });
            setNAddress(nAddress);
        }
    }, [document]);

    useEffect(() => {
        if (zaps.length > 0) {
            const total = getTotalFromZaps(zaps, document);
            setZapAmount(total);
            onZapAmountChange(document.id, total);
        }
    }, [zaps, document, onZapAmountChange]);

    if (zapsError) return <div>Error: {zapsError}</div>;

    return (
        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-gray-800 m-2 border-none">
            <div
                className="relative w-full h-0"
                style={{ paddingBottom: "56.25%" }}
            >
                <Image
                    alt="document thumbnail"
                    src={returnImageProxy(document.image)}
                    quality={100}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-foreground/50" />
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 text-white px-3 py-1 rounded-full">
                    <ZapDisplay zapAmount={zapAmount} event={document} zapsLoading={zapsLoading && zapAmount === 0} />
                </div>
                <CardHeader className="absolute bottom-[-8px] left-0 right-0 text-white bg-gray-800/70 w-fit rounded-lg rounded-bl-none rounded-tl-none rounded-br-none p-4 max-w-[70%] max-h-[60%]">
                    <div className="flex items-center justify-center gap-4">
                        <i className="pi pi-file text-2xl text-[#f8f8ff]"></i>
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl mb-2">{document.title}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
            </div>
            <CardContent className={`${isMobile ? "px-3" : ""} pt-6 pb-2 w-full flex flex-row justify-between items-start`}>
                <div className="flex flex-wrap gap-2 max-w-[65%]">
                    {document?.topics?.map((topic, index) => (
                        <Tag size="small" key={index} className="px-2 py-1 text-sm text-[#f8f8ff]">
                            {topic}
                        </Tag>
                    ))}
                    {isLesson && <Tag size="small" className="px-2 py-1 text-sm text-[#f8f8ff]" value="lesson" />}
                </div>
                <div className="flex flex-col items-end">
                    <p className="font-bold text-gray-300">{document?.readTime || "5 min"} read</p>
                    <div className="flex flex-col items-end">
                        {
                            document?.price && document?.price > 0 ? (
                                <Message className={`${isMobile ? "text-xs" : "text-base"} py-1 whitespace-nowrap`} icon="pi pi-lock" severity="info" text={`${document.price} sats`} />
                            ) : (
                                <Message className={`${isMobile ? "text-xs" : "text-base"} py-1 whitespace-nowrap`} icon="pi pi-lock-open" severity="success" text="Free" />
                            )
                        }
                    </div>
                </div>
            </CardContent>
            <CardDescription className={`${isMobile ? "w-full p-3" : "p-6"} py-2 pt-0 text-base text-neutral-50/90 dark:text-neutral-900/90 overflow-hidden min-h-[4em] flex items-center max-w-[100%]`}
                style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: "2"
                }}>
                <p className="line-clamp-2 text-wrap break-words overflow-hidden">{(document.summary || document.description)?.split('\n').map((line, index) => (
                    <span className="text-wrap break-words overflow-hidden" key={index}>{line}</span>
                ))}</p>
            </CardDescription>
            <CardFooter className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-700 pt-4 ${isMobile ? "px-3" : ""}`}>
                <p className="text-sm text-gray-300">{document?.published_at && document.published_at !== "" ? (
                    formatTimestampToHowLongAgo(document.published_at)
                ) : (
                    formatTimestampToHowLongAgo(document.created_at)
                )}</p>
                <GenericButton onClick={() => router.push(`/details/${nAddress}`)} size="small" label="Read" icon="pi pi-chevron-right" iconPos="right" outlined className="items-center py-2" />
            </CardFooter>
        </Card>
    )
}
