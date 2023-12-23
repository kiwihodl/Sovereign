import { PrimeReactProvider } from 'primereact/api';
// import '@/styles/globals.css'
import 'primereact/resources/themes/lara-dark-purple/theme.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <PrimeReactProvider>
            <Component {...pageProps} />
        </PrimeReactProvider>
    );
}