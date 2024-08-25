import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { useImageProxy } from "@/hooks/useImageProxy";
import { getTotalFromZaps } from "@/utils/lightning";
import { Tag } from "primereact/tag";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";

const ResourceTemplate = ({ resource }) => {
  const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: resource });
  const [zapAmount, setZapAmount] = useState(0);

  const router = useRouter();
  const { returnImageProxy } = useImageProxy();

  useEffect(() => {
    if (zaps.length > 0) {
      const total = getTotalFromZaps(zaps, resource);
      setZapAmount(total);
    }
  }, [zaps, resource]);

  if (zapsError) return <div>Error: {zapsError}</div>;

  return (
    <div
      className="flex flex-col items-center mx-auto px-4 mt-8 rounded-md"
    >
      {/* Wrap the image in a div with a relative class with a padding-bottom of 56.25% representing the aspect ratio of 16:9 */}
      <div
        onClick={() => router.replace(`/details/${resource.id}`)}
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
        <p className="text-sm text-gray-500 line-clamp-2">{resource.summary}</p>
        {resource.price && resource.price > 0 ? (
          <p className="text-sm text-gray-500 line-clamp-2">Price: {resource.price} sats</p>
        ) : (
          <p className="text-sm text-gray-500 line-clamp-2">Free</p>
        )}
        <div className="flex flex-row justify-between items-center mt-2">
          <p className="text-xs text-gray-400">
            {formatTimestampToHowLongAgo(resource.published_at)}
          </p>
          <ZapDisplay 
            zapAmount={zapAmount} 
            event={resource} 
            zapsLoading={zapsLoading && zapAmount === 0} 
          />
        </div>
        {resource?.topics && resource?.topics.length > 0 && (
          <div className="flex flex-row justify-start items-center mt-2">
            {resource.topics.map((topic, index) => (
              <Tag key={index} value={topic} className="mr-2 text-white" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceTemplate;