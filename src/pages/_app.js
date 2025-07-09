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
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { NDKProvider } from '@/context/NDKContext';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BottomBar from '@/components/BottomBar';
import { CartProvider } from '@/components/cart/cart-context';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <PrimeReactProvider>
      <SessionProvider session={session}>
        <NDKProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <CartProvider>
                <Layout>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main>
                      <Component {...pageProps} />
                      <Analytics />
                    </main>
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
