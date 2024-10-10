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
    const videoRef = useRef(null);

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

    // useEffect(() => {
    //     videoRef.current.play();
    //   }, []);

    return (
        <div className="h-[450px] relative flex justify-center items-center overflow-hidden">
            <Image
                src={HeroImage}
                alt="Banner"
                quality={100}
                fill
                style={{ objectFit: 'cover' }}
                className='opacity-100'
            />
            {/* <video
                src={"https://plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com/plebdevs-montage.mp4"}
                className={`object-cover w-full h-[450px] rounded-lg rounded-tr-none rounded-br-none`}
                ref={videoRef}
                loop
                muted
                playsInline
            /> */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black/40 to-transparent rounded-lg" />
            <div className={`absolute inset-0 flex flex-col justify-center ${isTabView ? 'items-center text-center' : 'items-start pl-12'}`}>
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${isTabView ? 'px-4' : ''}`}>
                    <span className="block">Learn to code</span>
                    <span className={`block ${getColorClass(currentTech)} transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                        Build {currentTech} apps
                    </span>
                    <span className="block">Become a dev</span>
                </h1>
                <h2 className="text-2xl text-[#f8f8ff] mb-8 font-semibold">
                    A one of a kind developer education and community platform built on Nostr and fully Lightning integrated.
                </h2>
                <div className="space-x-4">
                    <GenericButton
                        label="Learn"
                        icon="pi pi-book"
                        rounded
                        severity="info"
                        size="large"
                        outlined
                        onClick={() => router.push('/content?tag=all')}
                    />
                    <GenericButton
                        label="Connect"
                        icon="pi pi-users"
                        rounded
                        size="large"
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
