import { PrimeReactProvider } from 'primereact/api';
import Navbar from '@/components/navbar/Navbar';
import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import 'primereact/resources/themes/lara-dark-indigo/theme.css';

export default function MyApp({
    Component, pageProps: { session, ...pageProps }
  }) {
    return (
        <SessionProvider session={pageProps.session}>
            <PrimeReactProvider>
                <Navbar />
                <Component {...pageProps} />
            </PrimeReactProvider>
        </SessionProvider>
    );
}