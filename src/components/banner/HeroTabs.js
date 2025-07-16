import React from 'react';

const HeroTabs = ({ onTabChange, onStartQuiz }) => {
  const handleTabClick = () => {
    if (onStartQuiz) {
      onStartQuiz();
    } else {
      onTabChange('Bitcoin');
    }
  };

  const getTabStyles = () => {
    const baseStyles =
      'w-64 py-4 text-center rounded-lg transition-all duration-300 border-2 uppercase text-xl font-bold tracking-wider font-satoshi';
    return `${baseStyles} bg-orange-400 text-black border-orange-400`;
  };

  return (
    <div className="flex flex-col gap-4">
      <button className={getTabStyles()} onClick={handleTabClick}>
        Start
      </button>
    </div>
  );
};

export default HeroTabs;
