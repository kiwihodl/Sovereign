import React from 'react';
import Image from 'next/image';
import { Card } from 'primereact/card';
import useWindowWidth from '@/hooks/useWindowWidth';
import GenericButton from '@/components/buttons/GenericButton';
import InteractivePromotionalCarousel from '@/components/content/carousels/InteractivePromotionalCarousel';
import { useToast } from '@/hooks/useToast';

const AboutPage = () => {
  const { showToast } = useToast();
  const windowWidth = useWindowWidth();
  const isTabView = windowWidth <= 1160;
  const isMobile = windowWidth < 668;

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied', 'Copied Lightning Address to clipboard');
      if (window && window?.webln && window?.webln?.lnurl) {
        await window.webln.enable();
        const result = await window.webln.lnurl('austin@bitcoinpleb.dev');
        if (result && result?.preimage) {
          showToast('success', 'Payment Sent', 'Thank you for your donation!');
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`${isTabView ? 'w-full' : 'w-full px-12'} ${isMobile ? 'p-0' : 'p-4'} mx-auto`}>
      {/* Möbius BTC Philosophy Section */}
      <Card className="mb-6 relative overflow-hidden">
        {/* Subtle matrix-style background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50"></div>

        <div className="flex flex-col gap-6 relative z-10">
          {/* Möbius Strip Image */}
          <div className="flex justify-center mb-6">
            <Image
              src="/MöbiusBTC.png"
              alt="Möbius Strip representing the Hegelian dialectic"
              width={300}
              height={200}
              className="rounded-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Hegelian Dialectic Explanation */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              The Hegelian Dialectic
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-black p-6 rounded-xl border-2 border-yellow-500/50 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-yellow-500/25 hover:border-yellow-400">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <i className="pi pi-circle-fill text-black text-xl"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-yellow-400">Thesis</h4>
                  <p className="text-sm font-semibold text-yellow-300">The Gold Standard</p>
                  <p className="text-xs mt-3 text-yellow-200">
                    Sound money, limited supply, but difficult to transmit
                  </p>
                </div>
              </div>
              <div className="bg-black p-6 rounded-xl border-2 border-green-500/50 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-green-500/25 hover:border-green-400">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <i className="pi pi-circle text-black text-xl"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-green-400">Antithesis</h4>
                  <p className="text-sm font-semibold text-green-300">The Fiat Standard</p>
                  <p className="text-xs mt-3 text-green-200">
                    Infinite money, easy to transmit, but debased and censored
                  </p>
                </div>
              </div>
              <div className="bg-black p-6 rounded-xl border-2 border-[#FF9500]/50 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-[#FF9500]/25 hover:border-[#FF9500]">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#FF9500] rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <i className="pi pi-star-fill text-black text-xl"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-[#FF9500]">Synthesis</h4>
                  <p className="text-sm font-semibold text-[#FF9500]/80">Bitcoin</p>
                  <p className="text-xs mt-3 text-[#FF9500]/60">
                    Sound money that can be transmitted globally, uncensorable
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Philosophy */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg">
              <h4 className="text-xl font-bold mb-4 text-orange-400">Our Mission</h4>
              <p className="text-lg leading-relaxed">
                We aim to teach people how to use Bitcoin, Nostr, and privacy tools to become more
                sovereign and independent, so they can prosper in a world of infinite fiat money and
                finite time.
              </p>
            </div>

            {/* The Problem */}
            <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg">
              <h4 className="text-xl font-bold mb-4 text-red-400">The Problem</h4>
              <p className="text-lg leading-relaxed">
                This [fiat] theft funds endless wars, enriches the rich at the expense of the poor
                and ensures the road to serfdom. Many call this the cost of a civilized society, but
                we know better.
              </p>
            </div>

            {/* The Solution */}
            <div className="bg-green-900/20 border border-green-700 p-6 rounded-lg">
              <h4 className="text-xl font-bold mb-4 text-green-400">The Solution</h4>
              <p className="text-lg leading-relaxed">
                I will provide a website, with tutorials and the tradeoffs as I see them. It will be
                wrapped in an E-commerce store so that people can order what they need as they
                learn, to their PO Box, directly from the manufacturer.
              </p>
            </div>

            {/* Value for Value */}
            <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
              <h4 className="text-xl font-bold mb-4 text-blue-400">Value for Value</h4>
              <p className="text-lg leading-relaxed">
                The way I will monetize this, is what Māori call Koha, or as the NOSTRiches call:
                Value for value. I pray that people who find it valuable will donate, and the
                businesses I mention and recommend will find my content so valuable, that they will
                sponsor / donate so I can continue making it.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sponsors Section */}
      <Card className="mb-6 relative overflow-hidden">
        {/* Subtle matrix-style background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-30"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <i className="pi pi-users text-white text-2xl"></i>
            </div>
            <p className="text-lg text-gray-300">
              These organizations support our mission of Bitcoin education and sovereignty
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {/* Sponsor Placeholder Cards */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 text-center shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25 hover:border-purple-500/50">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <i className="pi pi-building text-white text-2xl"></i>
            </div>
            <h4 className="text-lg font-bold mb-2 text-white">Sponsor Name</h4>
            <p className="text-sm text-gray-300">Supporting Bitcoin education and sovereignty</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 text-center shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/25 hover:border-blue-500/50">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <i className="pi pi-building text-white text-2xl"></i>
            </div>
            <h4 className="text-lg font-bold mb-2 text-white">Sponsor Name</h4>
            <p className="text-sm text-gray-300">Supporting Bitcoin education and sovereignty</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 text-center shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-teal-500/25 hover:border-teal-500/50">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <i className="pi pi-building text-white text-2xl"></i>
            </div>
            <h4 className="text-lg font-bold mb-2 text-white">Sponsor Name</h4>
            <p className="text-sm text-gray-300">Supporting Bitcoin education and sovereignty</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400 mb-4">Interested in sponsoring our mission?</p>
          <button
            onClick={() => copyToClipboard('austin@bitcoinpleb.dev')}
            className="w-64 py-4 text-center rounded-lg transition-all duration-300 border-2 uppercase text-xl font-bold tracking-wider font-satoshi bg-black text-orange-400/70 border-orange-400/70 hover:text-orange-400 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/25 transform hover:scale-105"
          >
            Become a Sponsor
          </button>
        </div>
      </Card>

      {/* Donation Section */}
      <Card className="mb-6 relative overflow-hidden">
        {/* Subtle matrix-style background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-30"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <i className="pi pi-bolt text-white text-2xl"></i>
            </div>
            <p className="text-lg text-gray-300 mb-4">
              Help us continue building and educating for Bitcoin sovereignty
            </p>
            <p className="text-sm text-gray-400">
              Every donation helps us create more content and reach more people
            </p>
          </div>
        </div>

        <div className="flex justify-center relative z-10">
          <button
            onClick={() => copyToClipboard('austin@bitcoinpleb.dev')}
            className="w-64 py-4 text-center rounded-lg transition-all duration-300 border-2 uppercase text-xl font-bold tracking-wider font-satoshi bg-black text-yellow-400/70 border-yellow-400/70 hover:text-yellow-400 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/25 transform hover:scale-105"
          >
            Donate via Lightning
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AboutPage;
