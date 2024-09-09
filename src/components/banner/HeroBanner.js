import React, { useEffect, useState } from 'react';
import useWindowWidth from '@/hooks/useWindowWidth';
import Image from 'next/image';

const HeroBanner = () => {
    const options = ['Bitcoin', 'Lightning', 'Nostr'];
    const [currentOption, setCurrentOption] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    const windowWidth = useWindowWidth();

    const getColorClass = (option) => {
        switch (option) {
            case 'Bitcoin': return 'text-orange-400';
            case 'Lightning': return 'text-blue-500';
            case 'Nostr': return 'text-purple-400';
            default: return 'text-white';
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentOption((prevOption) => (prevOption + 1) % options.length);
                setTimeout(() => {
                    setIsFlipping(false);
                }, 400); // Start preparing to flip back a bit before the halfway point
            }, 400); // Update slightly before the midpoint for smoother transition
        }, 2500); // Increased to provide a slight pause between animations for readability

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex justify-center items-center">
            {windowWidth && (
                <Image
                    src="/images/plebdevs-banner.png"
                    alt="Banner"
                    width={windowWidth <= 1920 ? 1920 : windowWidth}
                    height={1080}
                    quality={100}
                    className='opacity-70'
                />
            )}
            <div className="w-[75vw] sm:w-[65vw] md:w-[45vw] lg:w-[45vw] xl:w-[37vw] absolute text-center text-white text-xl h-full flex flex-col justify-evenly">
                <p className='text-2xl md:text-4xl lg:text-5xl xl:text-5xl'>Learn how to code</p>
                <p className='text-2xl md:text-4xl lg:text-5xl xl:text-5xl'>
                    Build{' '}
                    <span className={`inline-block w-[50%] ${isFlipping ? 'flip-enter-active' : ''} ${getColorClass(options[currentOption])}`}>
                        {options[currentOption]}
                    </span>
                    {' '}Apps
                </p>
                <p className='text-2xl md:text-4xl lg:text-5xl xl:text-5xl'>Become a developer</p>
            </div>

        </div>
    );
};

export default HeroBanner;
