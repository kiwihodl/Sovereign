import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const HeroBanner = () => {
    const options = ['Bitcoin', 'Lightning', 'Nostr'];
    const [currentOption, setCurrentOption] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentOption((prevOption) => (prevOption + 1) % options.length);
                setFade(true);
            }, 700); // Half the interval time
        }, 1500); // Change text every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex justify-center items-center">
            <Image
                src="/plebdevs-banner.jpg"
                alt="Banner"
                width={1920}
                height={1080}
                quality={100}
            />
            <div className="absolute text-center text-white text-2xl">
                <p className='text-4xl'>Learn how to code</p>
                <p className='text-4xl pt-4'>
                    Build{' '}
                    <span className={`text-4xl pt-4 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                        {options[currentOption]}
                    </span>
                    {' '}apps
                </p>
                <p className='text-4xl pt-4'>Become a Bitcoin developer</p>
            </div>
        </div>
    );
};

export default HeroBanner;
