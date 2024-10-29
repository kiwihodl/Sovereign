import Head from 'next/head';
import React from 'react';
import CoursesCarousel from '@/components/content/carousels/CoursesCarousel';
import VideosCarousel from '@/components/content/carousels/VideosCarousel';
import DocumentsCarousel from '@/components/content/carousels/DocumentsCarousel';
import InteractivePromotionalCarousel from '@/components/content/carousels/InteractivePromotionalCarousel';
import HeroBanner from '@/components/banner/HeroBanner';

// todo: make paid course video and document lessons not appear in carousels
export default function Home() {
  return (
    <>
      <Head>
        <title>PlebDevs</title>
        <meta name="description" content="Learn to code" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {/* <InteractivePromotionalCarousel /> */}
        <HeroBanner />
        <CoursesCarousel />
        <VideosCarousel />
        <DocumentsCarousel />
      </main>
    </>
  );
}