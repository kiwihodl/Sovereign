import { PrimeReactProvider } from 'primereact/api';
import Navbar from '@/components/navbar/Navbar';
import '@/styles/globals.css'
import 'primereact/resources/themes/lara-dark-indigo/theme.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <PrimeReactProvider>
            <Navbar />
            <Component {...pageProps} />
        </PrimeReactProvider>
    );
}