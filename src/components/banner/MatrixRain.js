import React, { useEffect, useRef } from 'react';

const MatrixRain = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = width || window.innerWidth;
    canvas.height = height || window.innerHeight;

    // Matrix characters (you can customize this)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&*()';

    // Create drops
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    // Orange color in different opacities
    const getColor = opacity => `rgba(255, 149, 0, ${opacity})`; // #FF9500

    const draw = () => {
      // Black background with some opacity to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = getColor(1);
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      drops.forEach((y, i) => {
        // Generate random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Draw the character
        const x = i * fontSize;
        ctx.fillStyle = getColor(1); // Full opacity for newest chars
        ctx.fillText(char, x, y * fontSize);

        // Move the drop
        drops[i] = y > (canvas.height / fontSize) * 3 + Math.random() * 100 ? 0 : y + 1;
      });
    };

    // Animation loop
    const interval = setInterval(draw, 33); // ~30fps

    // Cleanup
    return () => clearInterval(interval);
  }, [width, height]);

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
