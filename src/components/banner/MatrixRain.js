import React, { useEffect, useRef } from 'react';

const MatrixRain = ({ selectedTab = 'Bitcoin' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&*()';

    // Create drops
    const fontSize = 20;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    // Get the end color based on selected tab
    const getEndColor = tab => {
      switch (tab) {
        case 'Bitcoin':
          return [255, 149, 0]; // text-orange-400
        case 'NOSTR':
          return [192, 132, 252]; // text-purple-400
        case 'Privacy':
          return [45, 212, 191]; // text-teal-400
        default:
          return [255, 149, 0];
      }
    };

    // The start color #ad7a41 in RGB
    const startColor = [173, 122, 65];

    const getGradientColor = (x, endColor) => {
      const progress = x / canvas.width;
      return [
        Math.floor(startColor[0] + (endColor[0] - startColor[0]) * progress),
        Math.floor(startColor[1] + (endColor[1] - startColor[1]) * progress),
        Math.floor(startColor[2] + (endColor[2] - startColor[2]) * progress),
      ];
    };

    const draw = () => {
      // Semi-transparent black background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const endColor = getEndColor(selectedTab);

      // Set text properties
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Generate random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Get gradient color based on x position
        const color = getGradientColor(i * fontSize, endColor);
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;

        // Draw the character
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Move drop and reset if needed
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    // Animation loop at half speed (66ms instead of 33ms)
    const interval = setInterval(draw, 66); // ~15fps

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reset drops array for new width
      const newColumns = Math.floor(canvas.width / fontSize);
      drops.length = 0;
      drops.push(...Array(newColumns).fill(1));
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedTab]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default MatrixRain;
