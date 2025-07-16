import React from 'react';
import Image from 'next/image';

const Footer = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/plebdevs',
      icon: 'pi pi-github',
      color: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]',
      borderColor: 'border-white',
      isImage: false,
      iconColor: 'text-white',
      iconSize: 'text-xl md:text-2xl',
    },
    {
      name: 'Twitter/X',
      url: 'https://twitter.com/plebdevs',
      icon: 'pi pi-twitter',
      color: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]',
      borderColor: 'border-blue-400',
      isImage: false,
      iconColor: 'text-blue-400',
      iconSize: 'text-lg md:text-xl',
    },
    {
      name: 'Nostr',
      url: 'https://nostr.com/npub1plebdevs',
      icon: '/images/nostr.png',
      color: 'hover:shadow-[0_0_20px_rgba(170,13,255,0.6)]',
      borderColor: 'border-[#aa0dff]',
      isImage: true,
      iconSize: 'w-6 h-6 md:w-7 md:h-7',
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@plebdevs',
      icon: 'pi pi-youtube',
      color: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]',
      borderColor: 'border-red-500',
      isImage: false,
      iconColor: 'text-red-500',
      iconSize: 'text-xl md:text-2xl',
    },
  ];

  return (
    <footer className="py-6 md:py-8 mt-2 mb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          {/* Social Media Icons */}
          <div className="flex space-x-3 md:space-x-4">
            {socialLinks.map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full bg-black border-2 ${social.borderColor}
                  flex items-center justify-center text-white text-lg md:text-xl
                  transition-all duration-300 ease-in-out
                  hover:scale-110 ${social.color}
                  group
                `}
                aria-label={social.name}
              >
                {social.isImage ? (
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={24}
                    height={24}
                    className={`${social.iconSize} group-hover:scale-110 transition-transform duration-300`}
                  />
                ) : (
                  <i
                    className={`${social.icon} ${social.iconColor} ${social.iconSize} group-hover:scale-110 transition-transform duration-300`}
                  ></i>
                )}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2024 Möbius BTC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
