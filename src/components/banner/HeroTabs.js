import React, { useState } from 'react';

const HeroTabs = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('Bitcoin');

  const handleTabClick = tab => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const getTabStyles = tab => {
    const isActive = activeTab === tab;
    const baseStyles =
      'w-64 py-4 text-center rounded-lg transition-all duration-300 border-2 uppercase text-xl font-bold tracking-wider font-satoshi';

    switch (tab) {
      case 'Bitcoin':
        return `${baseStyles} ${
          isActive
            ? 'bg-orange-400 text-black border-orange-400'
            : 'bg-black text-orange-400/70 border-orange-400/70 hover:text-orange-400 hover:border-orange-400'
        }`;
      case 'NOSTR':
        return `${baseStyles} ${
          isActive
            ? 'bg-purple-400 text-black border-purple-400'
            : 'bg-black text-purple-400/70 border-purple-400/70 hover:text-purple-400 hover:border-purple-400'
        }`;
      case 'Privacy':
        return `${baseStyles} ${
          isActive
            ? 'bg-teal-400 text-black border-teal-400'
            : 'bg-black text-teal-400/70 border-teal-400/70 hover:text-teal-400 hover:border-teal-400'
        }`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button className={getTabStyles('Bitcoin')} onClick={() => handleTabClick('Bitcoin')}>
        Bitcoin
      </button>
      <button className={getTabStyles('NOSTR')} onClick={() => handleTabClick('NOSTR')}>
        NOSTR
      </button>
      <button className={getTabStyles('Privacy')} onClick={() => handleTabClick('Privacy')}>
        Privacy
      </button>
    </div>
  );
};

export default HeroTabs;
