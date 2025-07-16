import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { parseEvent, parseCourseEvent } from '@/utils/nostr';
import { useDocuments } from '@/hooks/nostr/useDocuments';
import { useVideos } from '@/hooks/nostr/useVideos';
import { useCourses } from '@/hooks/nostr/useCourses';
import { useRouter } from 'next/router';
import HeroBanner from '@/components/banner/HeroBanner';
import BitcoinQuiz from '@/components/quiz/BitcoinQuiz';

export default function Home() {
  const router = useRouter();
  const { documents, documentsLoading } = useDocuments();
  const { videos, videosLoading } = useVideos();
  const { courses, coursesLoading } = useCourses();

  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [processedVideos, setProcessedVideos] = useState([]);
  const [processedCourses, setProcessedCourses] = useState([]);
  const [allContent, setAllContent] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);

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

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };
  return (
    <>
      <Head>
        <title>Möbius BTC</title>
        <meta name="description" content="Build on Bitcoin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <HeroBanner onStartQuiz={handleStartQuiz} />
        {showQuiz && (
          <div className="bg-gray-900 min-h-screen">
            <BitcoinQuiz />
          </div>
        )}
      </main>
    </>
  );
}
