import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const Button = dynamic(() => import('@getalby/bitcoin-connect-react').then(mod => mod.Button), {
  ssr: false,
});

let initialized = false;
let bitcoinConnectClient = null;

export async function initializeBitcoinConnect() {
  if (!initialized) {
    try {
      // Import the full module
      const bc = await import('@getalby/bitcoin-connect-react');
      
      // Initialize with the config options
      bc.init({
        appName: 'PlebDevs',
        filters: ['nwc'],
        showBalance: false,
      });
      
      // Store the client for use in components
      bitcoinConnectClient = bc.client;
      initialized = true;
      console.log('Bitcoin Connect initialized successfully, client:', bitcoinConnectClient);
    } catch (error) {
      // If the error is about custom element already being defined, we can ignore it
      // as it means the component is already initialized
      if (!error.message?.includes('has already been defined as a custom element')) {
        console.error('Error initializing Bitcoin Connect:', error);
      }
    }
  } else {
    console.log('Bitcoin Connect already initialized');
  }
  return bitcoinConnectClient;
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
