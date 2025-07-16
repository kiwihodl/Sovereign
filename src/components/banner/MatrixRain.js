import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dropsRef = useRef(null);

  // Fixed Bitcoin orange color
  const endColor = [255, 149, 0]; // text-orange-400

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&*()';

    // Create drops only once
    const fontSize = 20;
    const columns = canvas.width / fontSize;
    if (!dropsRef.current) {
      dropsRef.current = Array(Math.floor(columns)).fill(1);
    }

    // The start color #ad7a41 in RGB
    const startColor = [173, 122, 65];

    const getGradientColor = x => {
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

      // Set text properties
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      for (let i = 0; i < dropsRef.current.length; i++) {
        // Generate random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Get gradient color based on x position
        const color = getGradientColor(i * fontSize);
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;

        // Draw the character
        ctx.fillText(char, i * fontSize, dropsRef.current[i] * fontSize);

        // Move drop and reset if needed
        if (dropsRef.current[i] * fontSize > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }
        dropsRef.current[i]++;
      }
    };

    // Clear previous animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    // Animation loop at half speed (66ms instead of 33ms)
    animationRef.current = setInterval(draw, 66); // ~15fps

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reset drops array for new width
      const newColumns = Math.floor(canvas.width / fontSize);
      dropsRef.current = Array(newColumns).fill(1);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []); // No dependencies - animation runs once and doesn't reset

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
        pointerEvents: 'none', // Prevent canvas from capturing clicks
      }}
    />
  );
};

export default MatrixRain;
