import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatTimestampToHowLongAgo } from "@/utils/time";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useNostr } from "@/hooks/useNostr";
import { getSatAmountFromInvoice } from "@/utils/lightning";

const ResourceTemplate = (resource) => {
  const [zaps, setZaps] = useState([]);
  const [zapAmount, setZapAmount] = useState(null);
  const router = useRouter();
  const { returnImageProxy } = useImageProxy();
  const { fetchZapsForEvent } = useNostr();

  useEffect(() => {
    const fetchZaps = async () => {
      try {
        const zaps = await fetchZapsForEvent(resource);
        setZaps(zaps);
      } catch (error) {
        console.error("Error fetching zaps:", error);
      }
    };
    fetchZaps();
  }, [fetchZapsForEvent, resource]);

  useEffect(() => {
    if (zaps.length > 0) {
      zaps.map((zap) => {
        const bolt11Tag = zap.tags.find((tag) => tag[0] === "bolt11");
        const invoice = bolt11Tag ? bolt11Tag[1] : null;
        if (invoice) {
          const amount = getSatAmountFromInvoice(invoice);
          setZapAmount(zapAmount + amount);
        }
      });
    }
  }, [zaps]);

  return (
    <div
      className="flex flex-col items-center mx-auto px-4 mt-8 rounded-md"
    >
        {/* Wrap the image in a div with a relative class with a padding-bottom of 56.25% representing the aspect ratio of 16:9 */}
      <div 
        onClick={() => router.push(`/details/${resource.id}`)}
        className="relative w-full h-0 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
        style={{ paddingBottom: "56.25%"}}
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
        <div className="flex flex-row justify-between items-center mt-2">
          <p className="text-xs text-gray-400">
            {formatTimestampToHowLongAgo(resource.published_at)}
          </p>
          <p className="text-xs cursor-pointer">
          <i className="pi pi-bolt text-yellow-300"></i> {zapAmount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResourceTemplate;