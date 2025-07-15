import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { parseEvent, parseCourseEvent } from '@/utils/nostr';
import { useDocuments } from '@/hooks/nostr/useDocuments';
import { useVideos } from '@/hooks/nostr/useVideos';
import { useCourses } from '@/hooks/nostr/useCourses';
import { useRouter } from 'next/router';
import HeroBanner from '@/components/banner/HeroBanner';
import BitcoinSection from '@/components/content/sections/BitcoinSection';
import NostrSection from '@/components/content/sections/NostrSection';
import PrivacySection from '@/components/content/sections/PrivacySection';

const MenuTab = ({ selectedTopic, onTabChange, heroSelection = 'Bitcoin' }) => {
  const router = useRouter();

  const getTabStyles = (tab, heroTech) => {
    const isActive = selectedTopic === tab;
    const baseStyles =
      'px-6 sm:px-8 py-3 sm:py-4 text-center rounded-lg transition-all duration-300 border-2 uppercase text-lg sm:text-xl font-bold tracking-wider font-satoshi';

    switch (heroTech) {
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
        <button
          className={getTabStyles('Why', heroSelection)}
          onClick={() => handleTabClick('Why')}
        >
          Why
        </button>
        <button
          className={getTabStyles('What', heroSelection)}
          onClick={() => handleTabClick('What')}
        >
          What
        </button>
        <button
          className={getTabStyles('How', heroSelection)}
          onClick={() => handleTabClick('How')}
        >
          How
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { documents, documentsLoading } = useDocuments();
  const { videos, videosLoading } = useVideos();
  const { courses, coursesLoading } = useCourses();

  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [processedVideos, setProcessedVideos] = useState([]);
  const [processedCourses, setProcessedCourses] = useState([]);
  const [allContent, setAllContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('Why');
  const [heroSelection, setHeroSelection] = useState('Bitcoin');

  useEffect(() => {
    if (documents && !documentsLoading) {
      const processedDocuments = documents.map(document => ({
        ...parseEvent(document),
        type: 'document',
      }));
      setProcessedDocuments(processedDocuments);
    }
  }, [documents, documentsLoading]);

  useEffect(() => {
    if (videos && !videosLoading) {
      const processedVideos = videos.map(video => ({ ...parseEvent(video), type: 'video' }));
      setProcessedVideos(processedVideos);
    }
  }, [videos, videosLoading]);

  useEffect(() => {
    if (courses && !coursesLoading) {
      const processedCourses = courses.map(course => ({
        ...parseCourseEvent(course),
        type: 'course',
      }));
      setProcessedCourses(processedCourses);
    }
  }, [courses, coursesLoading]);

  useEffect(() => {
    const allContent = [...processedDocuments, ...processedVideos, ...processedCourses];
    setAllContent(allContent);
  }, [processedDocuments, processedVideos, processedCourses]);

  const handleTopicChange = newTopic => {
    setSelectedTopic(newTopic);
  };

  const handleHeroTabChange = heroTab => {
    setHeroSelection(heroTab);
  };

  return (
    <>
      <Head>
        <title>Möbius BTC</title>
        <meta name="description" content="Build on Bitcoin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <HeroBanner onHeroTabChange={handleHeroTabChange} />
        <MenuTab
          selectedTopic={selectedTopic}
          onTabChange={handleTopicChange}
          heroSelection={heroSelection}
        />
        <div className="w-full px-4 max-mob:px-0">
          {selectedTopic === 'Why' && heroSelection === 'Bitcoin' && <BitcoinSection />}
          {selectedTopic === 'Why' && heroSelection === 'NOSTR' && <NostrSection />}
          {selectedTopic === 'Why' && heroSelection === 'Privacy' && <PrivacySection />}
          {selectedTopic === 'What' && heroSelection === 'Bitcoin' && <BitcoinSection />}
          {selectedTopic === 'What' && heroSelection === 'NOSTR' && <NostrSection />}
          {selectedTopic === 'What' && heroSelection === 'Privacy' && <PrivacySection />}
          {selectedTopic === 'How' && (
            <div className="w-full max-w-6xl mx-auto px-4 py-12">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  How to Get Started
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Coming soon: Comprehensive courses and tutorials for {heroSelection.toLowerCase()}{' '}
                  development and usage.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
