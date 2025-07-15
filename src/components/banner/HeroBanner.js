import React, { useEffect, useState } from 'react';
import useWindowWidth from '@/hooks/useWindowWidth';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import GenericButton from '../buttons/GenericButton';
import MatrixRain from './MatrixRain';
import HeroTabs from './HeroTabs';

const HeroBanner = ({ onHeroTabChange }) => {
  const [currentTech, setCurrentTech] = useState('Bitcoin');
  const [selectedTab, setSelectedTab] = useState('Bitcoin');
  const [isAnimating, setIsAnimating] = useState(false);
  const techs = ['Bitcoin', 'NOSTR', 'Privacy'];
  const windowWidth = useWindowWidth();
  const router = useRouter();
  const { data: session } = useSession();

  const isTabView = windowWidth <= 1360;
  const isMobile = windowWidth <= 800;
  const isTablet = windowWidth <= 1024;
  const isWideScreen = windowWidth >= 2200;
  const isSuperWideScreen = windowWidth >= 2600;

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

  const handleHeroTabChange = tab => {
    setSelectedTab(tab);
    if (onHeroTabChange) {
      onHeroTabChange(tab);
    }
  };

  const getColorClass = tech => {
    switch (tech) {
      case 'Bitcoin':
        return 'text-orange-400';
      case 'NOSTR':
        return 'text-purple-400';
      case 'Privacy':
        return 'text-teal-400';
      default:
        return 'text-white';
    }
  };

  const getHeroHeight = () => {
    if (isSuperWideScreen) return 'h-[700px]';
    if (isWideScreen) return 'h-[550px]';
    if (isMobile) return 'h-[600px]';
    if (windowWidth <= 500) return 'h-screen';
    return 'h-[500px]';
  };

  const handleLearnToCode = async () => {
    const starterCourseUrl =
      '/course/naddr1qvzqqqr4xspzpueu32tp0jc47uzlcuxdgcw06m40ytu7ynpna2adnqty3e0vda6pqy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcpr9mhxue69uhhyetvv9ujuumwdae8gtnnda3kjctv9uq3wamnwvaz7tmjv4kxz7fwdehhxarj9e3xzmny9uq36amnwvaz7tmjv4kxz7fwd46hg6tw09mkzmrvv46zucm0d5hsz9mhwden5te0wfjkccte9ec8y6tdv9kzumn9wshszynhwden5te0dehhxarjxgcjucm0d5hszynhwden5te0dehhxarjw4jjucm0d5hsz9nhwden5te0wp6hyurvv4ex2mrp0yhxxmmd9uq3wamnwvaz7tmjv4kxz7fwv3jhvueww3hk7mrn9uqzge34xvuxvdtrx5knzcfhxgkngwpsxsknsetzxyknxe3sx43k2cfkxsurwdq68epwa?active=starter';

    // If user is already signed in, redirect directly
    if (session?.user) {
      router.push(starterCourseUrl);
      return;
    }

    // Check for stored keys
    const storedPubkey = localStorage.getItem('anonymousPubkey');
    const storedPrivkey = localStorage.getItem('anonymousPrivkey');

    if (storedPubkey && storedPrivkey) {
      // Sign in with stored keys
      const result = await signIn('anonymous', {
        pubkey: storedPubkey,
        privkey: storedPrivkey,
        redirect: false,
        callbackUrl: starterCourseUrl,
      });

      if (result?.ok) {
        router.push(starterCourseUrl);
      }
    } else {
      // Proceed with anonymous sign in
      const result = await signIn('anonymous', {
        callbackUrl: starterCourseUrl,
        redirect: false,
      });

      if (result?.ok) {
        // Wait a moment for the session to be updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch the session
        const session = await getSession();

        if (session?.user?.pubkey && session?.user?.privkey) {
          localStorage.setItem('anonymousPubkey', session.user.pubkey);
          localStorage.setItem('anonymousPrivkey', session.user.privkey);
          router.push('/');
        } else {
          console.error('Session data incomplete:', session);
        }
      }
    }
  };

  return (
    <div
      className={`${getHeroHeight()} ${isTabView ? 'mx-0 w-full' : 'mt-4 mx-12'} relative flex justify-center items-center overflow-hidden drop-shadow-2xl rounded-lg`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <MatrixRain selectedTab={selectedTab} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-black from-20% via-black/60 via-32% to-transparent rounded-lg" />

      {/* Desktop Layout - Grid */}
      <div
        className={`absolute inset-0 ${isTablet ? `flex flex-col ${windowWidth <= 500 ? 'justify-start items-center pt-6' : 'justify-center items-center'}` : 'grid grid-cols-2 gap-8'}`}
      >
        {/* Left side - Text content */}
        <div
          className={`${isTablet ? `flex flex-col items-center text-center px-8 ${windowWidth <= 500 ? 'py-4' : 'py-6'}` : 'flex flex-col justify-center pl-8'}`}
        >
          <h1 className="text-4xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-4 pointer-events-none">
            <span className="block">
              Learn{' '}
              <span
                className={`${getColorClass(currentTech)} transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
              >
                {currentTech}
              </span>
            </span>
            <span className="block">Be sovereign</span>
          </h1>

          {/* Only show this text on desktop */}
          {!isTablet && (
            <h2 className="text-[#f8f8ff] mb-6 font-semibold max-w-[90%] pointer-events-none">
              The root problem is all of the trust that was required.
              <br />
              Banks censor and debase the currency in the name of stability.
              <br />
              Social platforms shadow ban andcensor in the name of safety.
              <br />
              Devices spy on you and sell your data in the name of security.
              <br />
            </h2>
          )}

          {/* Only show avatar group on desktop */}
          {!isTablet && (
            <div className="mb-6 flex flex-row hover:opacity-70 cursor-pointer pointer-events-none">
              <AvatarGroup>
                <Avatar
                  image={
                    'https://pbs.twimg.com/profile_images/1674493492519751680/wxuiYCJA_400x400.jpg'
                  }
                  size={isMobile ? 'normal' : 'large'}
                  shape="circle"
                />
                <Avatar
                  image={
                    'https://cdn.discordapp.com/avatars/823623334582681610/a19c596166584d2f51e444103255336d.png?size=1024'
                  }
                  size={isMobile ? 'normal' : 'large'}
                  shape="circle"
                />
                <Avatar
                  image={
                    'https://pbs.twimg.com/profile_images/1724533572537880576/WBcctRHT_400x400.jpg'
                  }
                  size={isMobile ? 'normal' : 'large'}
                  shape="circle"
                />
                <Avatar
                  image={
                    'https://cdn.discordapp.com/avatars/850975720872214578/37b3790a77e5c848d9489c2649420aa9.png?size=1024'
                  }
                  size={isMobile ? 'normal' : 'large'}
                  shape="circle"
                />
                <Avatar
                  image={'https://i.nostr.build/BksqZ8QSHxr9FGj2.webp'}
                  size={isMobile ? 'normal' : 'large'}
                  shape="circle"
                />
                <Avatar
                  label="500+"
                  shape="circle"
                  size={isMobile ? 'normal' : 'large'}
                  className={`${isMobile ? 'text-sm' : 'text-base'}`}
                />
              </AvatarGroup>
              <div className="flex flex-col justify-between my-2 ml-4">
                <div className="flex flex-row gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <i
                      key={index}
                      className={`pi pi-star-fill text-yellow-500 ${isMobile ? 'text-base' : 'text-2xl'}`}
                    />
                  ))}
                  <p className={`text-sm ${isMobile ? 'text-base' : 'text-2xl'}`}>4.87</p>
                </div>
                <span className={`text-sm ${isMobile ? 'text-base' : 'text-2xl'}`}>
                  500+ students enrolled
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Tabs */}
        <div
          className={`${isTablet ? `flex items-center justify-center px-8 ${windowWidth <= 500 ? 'mt-4 pb-4' : 'mt-8 pb-6'}` : 'flex items-center justify-center pr-8'}`}
        >
          <HeroTabs onTabChange={handleHeroTabChange} />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
