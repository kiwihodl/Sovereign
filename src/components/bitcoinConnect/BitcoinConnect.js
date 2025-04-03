import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const Button = dynamic(() => import('@getalby/bitcoin-connect-react').then(mod => mod.Button), {
  ssr: false,
});

let initialized = false;

export async function initializeBitcoinConnect() {
  if (!initialized) {
    try {
      const { init } = await import('@getalby/bitcoin-connect-react');
      // Check if custom elements are already registered
      if (!customElements.get('bc-balance')) {
        init({
          appName: 'PlebDevs',
          filters: ['nwc'],
          showBalance: false,
        });
        initialized = true;
      }
    } catch (error) {
      // If the error is about custom element already being defined, we can ignore it
      // as it means the component is already initialized
      if (!error.message?.includes('has already been defined as a custom element')) {
        console.error('Error initializing Bitcoin Connect:', error);
      }
    }
  }
}

const BitcoinConnectButton = () => {
  useEffect(() => {
    initializeBitcoinConnect();
  }, []);

  return (
    <Button
      onConnect={provider => {
        console.log('provider:', provider);
      }}
    />
  );
};

export default BitcoinConnectButton;
