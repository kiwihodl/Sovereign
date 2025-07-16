import React from 'react';
import Head from 'next/head';
import BitcoinQuiz from '@/components/quiz/BitcoinQuiz';

export default function QuizPage() {
  return (
    <>
      <Head>
        <title>Bitcoin Assessment Quiz - Möbius BTC</title>
        <meta
          name="description"
          content="Take our Bitcoin assessment quiz to get personalized recommendations"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gray-900">
        <BitcoinQuiz />
      </main>
    </>
  );
}
