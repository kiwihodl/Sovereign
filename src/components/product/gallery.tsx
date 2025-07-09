'use client';

import { useRouter } from 'next/router';
import { GridTileImage } from '@/components/grid/tile';
import Link from 'next/link';
import Image from 'next/image';

export function Gallery({ images }: { images: { src: string; altText: string }[] }) {
  const router = useRouter();
  const { pathname, query } = router;
  const imageSearchParam = query.image;
  const imageIndex = imageSearchParam ? parseInt(imageSearchParam as string) : 0;

  const nextSearchParams = new URLSearchParams(query as any);
  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  nextSearchParams.set('image', nextImageIndex.toString());

  const previousSearchParams = new URLSearchParams(query as any);
  const previousImageIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;
  previousSearchParams.set('image', previousImageIndex.toString());

  return (
    <>
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        {images[imageIndex] && (
          <Image
            className="h-full w-full object-contain"
            src={images[imageIndex].src}
            alt={images[imageIndex].altText}
            width={550}
            height={550}
          />
        )}
      </div>

      {images.length > 1 ? (
        <ul className="my-12 flex items-center justify-center gap-2 overflow-auto py-1 lg:mb-0">
          {images.map((image, index) => {
            const newParams = new URLSearchParams(router.query as any);
            newParams.set('image', index.toString());
            const isActive = index === imageIndex;
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
      ) : null}
    </>
  );
}
