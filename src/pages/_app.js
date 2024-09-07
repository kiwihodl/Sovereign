import { PrimeReactProvider } from 'primereact/api';
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { ToastProvider } from '@/hooks/useToast';
import { SessionProvider } from "next-auth/react"
import Layout from '@/components/Layout';
import '@/styles/globals.css'
import 'primereact/resources/themes/lara-dark-blue/theme.css'
import '@/styles/custom-theme.css'; // custom theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import Sidebar from '@/components/sidebar/Sidebar';
import { NDKProvider } from '@/context/NDKContext';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import BottomBar from '@/components/BottomBar';

const queryClient = new QueryClient()

export default function MyApp({
    Component, pageProps: { session, ...pageProps }
}) {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    useEffect(() => {
        const handleSidebarToggle = (event) => {
            setSidebarExpanded(event.detail.isExpanded);
        };

        window.addEventListener('sidebarToggle', handleSidebarToggle);

        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle);
        };
    }, []);

    return (
        <PrimeReactProvider>
            <SessionProvider session={session}>
                <NDKProvider>
                    <QueryClientProvider client={queryClient}>
                        <ToastProvider>
                            <Layout>
                                <div className="flex flex-col min-h-screen">
                                    <Navbar />
                                    <div className='flex'>
                                        <Sidebar />
                                        <div className='max-w-[100vw] pl-[14vw] max-sidebar:pl-0 pb-16 max-sidebar:pb-20'>
                                            <Component {...pageProps} />
                                        </div>
                                    </div>
                                    <BottomBar />
                                </div>
                            </Layout>
                        </ToastProvider>
                    </QueryClientProvider>
                </NDKProvider>
            </SessionProvider>
        </PrimeReactProvider>
    );
}