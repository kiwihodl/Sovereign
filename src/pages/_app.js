import { PrimeReactProvider } from 'primereact/api';
import { useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { ToastProvider } from '@/hooks/useToast';
import { SessionProvider } from "next-auth/react"
import Layout from '@/components/Layout';
import '@/styles/globals.css'
// import 'primereact/resources/themes/lara-dark-indigo/theme.css';
import 'primereact/resources/themes/lara-dark-blue/theme.css'
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import Sidebar from '@/components/sidebar/Sidebar';
import { NDKProvider } from '@/context/NDKContext';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function MyApp({
    Component, pageProps: { session, ...pageProps }
}) {
    return (
        <PrimeReactProvider>
            <SessionProvider session={session}>
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
            </SessionProvider>
        </PrimeReactProvider>
    );
}