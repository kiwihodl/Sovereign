import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Essential Meta Tags */}
          <meta charSet="utf-8" />
          <meta name="robots" content="index, follow" />

          {/* Default Meta Tags (can be overridden per page) */}
          <meta
            name="description"
            content="Möbius BTC - Developer education and content platform built on Nostr with Lightning integration"
          />
          <meta
            name="keywords"
            content="bitcoin, lightning network, nostr, web development, programming, education, courses"
          />
          <meta name="author" content="Möbius BTC" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Möbius BTC" />
          <meta property="og:locale" content="en_US" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@pleb_devs" />
          <meta name="twitter:creator" content="@pleb_devs" />

          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'EducationalOrganization',
                name: 'Möbius BTC',
                description:
                  'Developer education and content platform built on Nostr with Lightning integration',
                url: 'https://plebdevs.com',
                sameAs: [
                  'https://x.com/pleb_devs',
                  'https://github.com/austinkelsay/plebdevs',
                  'https://www.youtube.com/@plebdevs',
                ],
              }),
            }}
          />

          {/* Existing Font Configuration */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Blinker:wght@100;200;300;400;600;700;800;900&family=Poppins&display=swap"
            rel="stylesheet"
          />

          {/* Existing Favicon Configuration */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
          <link rel="manifest" href="/site.webmanifest" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
