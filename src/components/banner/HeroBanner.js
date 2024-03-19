import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const HeroBanner = () => {
    const options = ['Bitcoin', 'Lightning', 'Nostr'];
    const [currentOption, setCurrentOption] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

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
            <Image
                src="/plebdevs-banner.jpg"
                alt="Banner"
                width={1920}
                height={1080}
                quality={100}
            />
            <div className="absolute text-center text-white text-xl">
                <p className='text-4xl max-tab:text-xl max-mob:text-xl'>Learn how to code</p>
                <p className='text-4xl pt-4 max-tab:text-xl max-mob:text-xl max-tab:pt-2 max-mob:pt-2'>
                    Build{' '}
                    <span className={`text-4xl max-tab:text-xl max-mob:text-xl inline-block w-40 text-center max-tab:w-24 max-mob:w-24 ${isFlipping ? 'flip-enter-active' : ''}`}>
                        {options[currentOption]}
                    </span>
                    {' '}apps
                </p>
                <p className='text-4xl pt-4 max-tab:text-xl max-mob:text-xl max-tab:pt-2 max-mob:pt-2'>Become a Bitcoin developer</p>
            </div>
        </div>
    );
};

export default HeroBanner;
