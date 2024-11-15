import Head from 'next/head';
import React from 'react';
import CoursesCarousel from '@/components/content/carousels/CoursesCarousel';
import VideosCarousel from '@/components/content/carousels/VideosCarousel';
import DocumentsCarousel from '@/components/content/carousels/DocumentsCarousel';
import HeroBanner from '@/components/banner/HeroBanner';

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
        <HeroBanner />
        <CoursesCarousel />
        <VideosCarousel />
        <DocumentsCarousel />
      </main>
    </>
  );
}