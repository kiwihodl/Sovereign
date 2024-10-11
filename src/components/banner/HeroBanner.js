import React, { useEffect, useState, useRef } from 'react';
import useWindowWidth from '@/hooks/useWindowWidth';
import Image from 'next/image';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useRouter } from 'next/router';
import GenericButton from '../buttons/GenericButton';
import HeroImage from '../../../public/images/hero-image.png';

const HeroBanner = () => {
    const [currentTech, setCurrentTech] = useState('Bitcoin');
    const [isAnimating, setIsAnimating] = useState(false);
    const techs = ['Bitcoin', 'Lightning', 'Nostr'];
    const windowWidth = useWindowWidth();
    const isTabView = windowWidth <= 1360;
    const router = useRouter();
    const { returnImageProxy } = useImageProxy();

    const isMobile = windowWidth <= 800;

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentTech(prev => {
                    const currentIndex = techs.indexOf(prev);
                    return techs[(currentIndex + 1) % techs.length];
                });
                setIsAnimating(false);
            }, 400); // Half of the interval for smooth transition
        }, 2800);

        return () => clearInterval(interval);
    }, []);

    const getColorClass = (tech) => {
        switch (tech) {
            case 'Bitcoin': return 'text-orange-400';
            case 'Lightning': return 'text-blue-500';
            case 'Nostr': return 'text-purple-400';
            default: return 'text-white';
        }
    };

    return (
        <div className={`${isMobile ? 'h-[350px]' : 'h-[450px]'} mx-0 relative flex justify-center items-center overflow-hidden`}>
            <Image
                // src={returnImageProxy("https://media.istockphoto.com/id/1224500457/photo/programming-code-abstract-technology-background-of-software-developer-and-computer-script.jpg?s=612x612&w=0&k=20&c=nHMypkMTU1HUUW85Zt0Ff7MDbq17n0eVeXaoM9Knt4Q=")}
                src={HeroImage}
                alt="Banner"
                quality={100}
                fill
                style={{ objectFit: 'cover' }}
                className='opacity-100 rounded-lg'
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black/20 to-transparent rounded-lg" />
            
            {!isTabView && (
                <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden rounded-r-lg opacity-100 p-8 rounded-lg shadow-lg">
                    <video
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="https://plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com/plebdevs-montage.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            <div className={`absolute inset-0 flex flex-col justify-center ${isTabView ? 'items-center text-center' : 'items-start pl-12'}`}>
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${isTabView ? 'px-4' : ''}`}>
                    <span className="block">Learn to code</span>
                    <span className={`block ${getColorClass(currentTech)} transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                        Build {currentTech} apps
                    </span>
                    <span className="block">Become a dev</span>
                </h1>
                {isMobile ? (
                    <h3 className="text-[#f8f8ff] mb-8 font-semibold">
                        A one of a kind developer education and community platform built on Nostr and fully Lightning integrated.
                    </h3>
                ) : (
                    <h2 className="text-[#f8f8ff] mb-8 font-semibold max-w-[50%]">
                        A one of a kind developer education and community platform built on Nostr and fully Lightning integrated.
                    </h2>
                )}
                <div className="space-x-4">
                    <GenericButton
                        label="Learn"
                        icon="pi pi-book"
                        rounded
                        severity="info"
                        size={isMobile ? null : "large"}
                        outlined
                        onClick={() => router.push('/content?tag=all')}
                    />
                    <GenericButton
                        label="Connect"
                        icon="pi pi-users"
                        rounded
                        size={isMobile ? null : "large"}
                        severity="success"
                        outlined
                        onClick={() => router.push('/feed?channel=global')}
                    />
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
