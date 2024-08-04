import { PrimeReactProvider } from 'primereact/api';
import { useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { ToastProvider } from '@/hooks/useToast';
import Layout from '@/components/Layout';
import '@/styles/globals.css'
import 'primereact/resources/themes/lara-dark-indigo/theme.css';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import Sidebar from '@/components/sidebar/Sidebar';
import { NostrProvider } from '@/context/NostrContext';
import { NDKProvider } from '@/context/NDKContext';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function MyApp({
    Component, pageProps: { ...pageProps }
}) {
    return (
        <PrimeReactProvider>
            <NostrProvider>
                <NDKProvider>
                    <QueryClientProvider client={queryClient}>
                        <ToastProvider>
                            <Layout>
                                <div className="flex flex-col min-h-screen">
                                    <Navbar />
                                    {/* <div className='flex'> */}
                                    {/* <Sidebar /> */}
                                    {/* <div className='max-w-[100vw] pl-[15vw]'> */}
                                    <div className='max-w-[100vw]'>
                                        <Component {...pageProps} />
                                    </div>
                                    {/* </div> */}
                                </div>
                            </Layout>
                        </ToastProvider>
                    </QueryClientProvider>
                </NDKProvider>
            </NostrProvider>
        </PrimeReactProvider>
    );
}