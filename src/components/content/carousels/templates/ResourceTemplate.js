import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { useImageProxy } from "@/hooks/useImageProxy";
import { getTotalFromZaps } from "@/utils/lightning";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";

const ResourceTemplate = ({ resource }) => {
  const [zapAmount, setZapAmount] = useState(null);
  const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: resource });

  const router = useRouter();
  const { returnImageProxy } = useImageProxy();

  useEffect(() => {
    if (!zaps || zapsLoading || zapsError) return;

    const total = getTotalFromZaps(zaps, resource);

    setZapAmount(total);
  }, [resource, zaps, zapsLoading, zapsError]);

  if (zapsError) return <div>Error: {zapsError}</div>;

  return (
    <div
      className="flex flex-col items-center mx-auto px-4 mt-8 rounded-md"
    >
      {/* Wrap the image in a div with a relative class with a padding-bottom of 56.25% representing the aspect ratio of 16:9 */}
      <div
        onClick={() => router.push(`/details/${resource.id}`)}
        className="relative w-full h-0 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
        style={{ paddingBottom: "56.25%" }}
      >
        <Image
          alt="resource thumbnail"
          src={returnImageProxy(resource.image)}
          quality={100}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div className="flex flex-col justify-start w-full mt-4">
        <h4 className="mb-1 font-bold text-lg font-blinker line-clamp-2">
          {resource.title}
        </h4>
        <p className="text-sm text-gray-500 min-h-[40px] line-clamp-2">{resource.summary}</p>
        <div className="flex flex-row justify-between items-center mt-2">
          <p className="text-xs text-gray-400">
            {formatTimestampToHowLongAgo(resource.published_at)}
          </p>
          <ZapDisplay zapAmount={zapAmount} event={resource} zapsLoading={zapsLoading} />
        </div>
      </div>
    </div>
  );
};

export default ResourceTemplate;
