import React, { useState } from 'react';
import { useRouter } from 'next/router';

const HeroTabs = () => {
  const [activeTab, setActiveTab] = useState('Bitcoin');
  const router = useRouter();

  const tabs = ['Bitcoin', 'Nostr', 'Privacy'];

  const handleButtonClick = path => {
    router.push(path);
  };

  const renderTabContent = () => {
    const buttonStyles = {
      Bitcoin: 'bg-orange-500 hover:bg-orange-600',
      Nostr: 'bg-purple-500 hover:bg-purple-600',
      Privacy: 'bg-teal-500 hover:bg-teal-600',
    };

    const baseButtonClasses =
      'text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105';

    const renderButtons = type => (
      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={() => handleButtonClick(`/${type.toLowerCase()}/why`)}
          className={`${buttonStyles[type]} ${baseButtonClasses}`}
        >
          Why {type}?
        </button>
        <button
          onClick={() => handleButtonClick(`/${type.toLowerCase()}/what`)}
          className={`${buttonStyles[type]} ${baseButtonClasses}`}
        >
          What is {type}?
        </button>
        <button
          onClick={() => handleButtonClick(`/${type.toLowerCase()}/how`)}
          className={`${buttonStyles[type]} ${baseButtonClasses}`}
        >
          How to {type}?
        </button>
      </div>
    );

    return renderButtons(activeTab);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 w-full">
      <div className="flex gap-4 border-b border-gray-600">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold transition-all duration-300 ${
              activeTab === tab
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {renderTabContent()}
    </div>
  );
};

export default HeroTabs;
