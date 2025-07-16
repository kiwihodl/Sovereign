import React, { useState } from 'react';
import BitcoinSection from '@/components/content/sections/BitcoinSection';
import { useRouter } from 'next/router';
import Head from 'next/head';

const MenuTab = ({ selectedTopic, onTabChange }) => {
  const router = useRouter();

  const getTabStyles = tab => {
    const isActive = selectedTopic === tab;
    const baseStyles =
      'px-6 sm:px-8 py-3 sm:py-4 text-center rounded-lg transition-all duration-300 border-2 uppercase text-lg sm:text-xl font-bold tracking-wider font-satoshi';

    return `${baseStyles} ${
      isActive
        ? 'bg-orange-400 text-black border-orange-400'
        : 'bg-black text-orange-400/70 border-orange-400/70 hover:text-orange-400 hover:border-orange-400'
    }`;
  };

  const handleTabClick = tab => {
    onTabChange(tab);
    if (tab === 'What') {
      // Scroll to the "What" section (anchor)
      const whatSection = document.getElementById('what-section');
      if (whatSection) {
        whatSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="sticky top-[90px] z-30 py-4 pt-8">
      <div className="flex justify-center items-center gap-3 sm:gap-4">
        <button className={getTabStyles('Why')} onClick={() => handleTabClick('Why')}>
          Why
        </button>
        <button className={getTabStyles('What')} onClick={() => handleTabClick('What')}>
          What
        </button>
        <button className={getTabStyles('How')} onClick={() => handleTabClick('How')}>
          How
        </button>
      </div>
    </div>
  );
};

export default function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState('Why');

  const handleTopicChange = newTopic => {
    setSelectedTopic(newTopic);
  };

  return (
    <>
      <Head>
        <title>Learn Bitcoin - Möbius BTC</title>
        <meta
          name="description"
          content="Learn about Bitcoin, why it matters, what it is, and how to get started"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <MenuTab selectedTopic={selectedTopic} onTabChange={handleTopicChange} />
        <div className="w-full px-4 max-mob:px-0">
          {selectedTopic === 'Why' && <BitcoinSection />}
          {selectedTopic === 'What' && <BitcoinSection />}
          {selectedTopic === 'How' && (
            <div className="w-full max-w-6xl mx-auto px-4 py-12">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  How to Get Started
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Coming soon: Comprehensive courses and tutorials for Bitcoin development and
                  usage.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
