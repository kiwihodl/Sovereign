import { PrimeReactProvider } from 'primereact/api';
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import Navbar from '@/components/navbar/Navbar';
import { ToastProvider } from '@/hooks/useToast';
import Layout from '@/components/Layout';
import '@/styles/globals.css'
import 'primereact/resources/themes/lara-dark-indigo/theme.css';
import Sidebar from '@/components/sidebar/Sidebar';

export default function MyApp({
    Component, pageProps: { ...pageProps }
}) {
    return (
        <Provider store={store}>
            <PrimeReactProvider>
                <ToastProvider>
                    <Layout>
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <div style={{ display: 'flex', flex: '1' }}>
                                <Sidebar />
                                <div style={{ flex: 1 }}>
                                    <Component {...pageProps} />
                                </div>
                            </div>
                        </div>
                    </Layout>
                </ToastProvider>
            </PrimeReactProvider>
        </Provider>
    );
}