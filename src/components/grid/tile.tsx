import clsx from 'clsx';
import Image from 'next/image';

export function GridTileImage({
  active,
  ...props
}: {
  active?: boolean;
  alt: string;
  src: string;
  width: number;
  height: number;
} & React.ComponentProps<'img'>) {
  return (
    <div
      className={clsx(
        'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
        {
          'border-2 border-blue-600': active,
          'border-neutral-200 dark:border-neutral-800': !active,
        }
      )}
    >
      {props.src ? (
        <Image
          className="relative h-full w-full object-contain transition duration-300 ease-in-out group-hover:scale-105"
          {...props}
        />
      ) : null}
    </div>
  );
}
