'use client';

import { useRouter } from 'next/router';
import { GridTileImage } from '@/components/grid/tile';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function Gallery({ images }: { images: { src: string; altText: string }[] }) {
  const router = useRouter();
  const { pathname, query } = router;
  const imageSearchParam = query.image;
  const imageIndex = imageSearchParam ? parseInt(imageSearchParam as string) : 0;

  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const visibleThumbnails = images.slice(thumbnailIndex, thumbnailIndex + 4);

  const handleNextThumbnails = () => {
    const newIndex = thumbnailIndex + 4 >= images.length ? 0 : thumbnailIndex + 4;
    setThumbnailIndex(newIndex);
  };

  const handlePrevThumbnails = () => {
    const newIndex = thumbnailIndex - 4 < 0 ? Math.max(0, images.length - 4) : thumbnailIndex - 4;
    setThumbnailIndex(newIndex);
  };

  return (
    <>
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        {images[imageIndex] && (
          <Image
            className="h-full w-full object-contain"
            src={images[imageIndex].src}
            alt={images[imageIndex].altText}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
        )}
      </div>

      {images.length > 1 ? (
        <div className="my-12 flex items-center justify-center gap-2 overflow-auto py-1 lg:mb-0">
          <button onClick={handlePrevThumbnails} className="p-2">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <ul className="flex items-center justify-center gap-2">
            {visibleThumbnails.map((image, index) => {
              const newParams = new URLSearchParams(router.query as any);
              const globalIndex = thumbnailIndex + index;
              newParams.set('image', globalIndex.toString());
              const isActive = globalIndex === imageIndex;
              return (
                <li key={image.src} className="h-20 w-20">
                  <Link
                    aria-label="Enlarge product image"
                    href={`${pathname}?${newParams.toString()}`}
                    scroll={false}
                    className="h-full w-full"
                  >
                    <GridTileImage
                      alt={image.altText}
                      src={image.src}
                      width={80}
                      height={80}
                      active={isActive}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          <button onClick={handleNextThumbnails} className="p-2">
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      ) : null}
    </>
  );
}
