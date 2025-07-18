import { PrimeReactProvider } from 'primereact/api';
import Navbar from '@/components/navbar/Navbar';
import { ToastProvider } from '@/hooks/useToast';
import { SessionProvider } from 'next-auth/react';
import Layout from '@/components/Layout';
import '@/styles/globals.css';
import 'primereact/resources/themes/lara-dark-blue/theme.css';
import '@/styles/custom-theme.css'; // custom theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { NDKProvider } from '@/context/NDKContext';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BottomBar from '@/components/BottomBar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/cart/cart-context';
import Head from 'next/head';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <PrimeReactProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={session}>
        <NDKProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <CartProvider>
                <Layout>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Component {...pageProps} />
                      <Analytics />
                    </main>
                    <Footer />
                    <div className="mt-12 min-bottom-bar:mt-0">
                      <BottomBar />
                    </div>
                  </div>
                </Layout>
              </CartProvider>
            </ToastProvider>
          </QueryClientProvider>
        </NDKProvider>
      </SessionProvider>
    </PrimeReactProvider>
  );
}
