import { useState, useEffect } from 'react';

const useResponsiveImageDimensions = () => {
  // Initialize screenWidth with a default value for SSR
  // This can be a typical screen width or the smallest size you want to target
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    // Set the initial width on the client side
    setScreenWidth(window.innerWidth);

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const calculateImageDimensions = () => {
    if (screenWidth >= 1200) {
      return { width: 426, height: 240 }; // Large screens
    } else if (screenWidth >= 768 && screenWidth < 1200) {
      return { width: 344, height: 194 }; // Medium screens
    } else if (screenWidth > 0) {
      // Check if screenWidth is set to avoid incorrect rendering during SSR
      return { width: screenWidth - 120, height: (screenWidth - 120) * (9 / 16) }; // Small screens
    } else {
      return { width: 0, height: 0 }; // Default sizes or SSR fallback
    }
  };

  return calculateImageDimensions();
};

export default useResponsiveImageDimensions;
