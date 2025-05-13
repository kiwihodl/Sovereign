import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const Button = dynamic(() => import('@getalby/bitcoin-connect-react').then(mod => mod.Button), {
  ssr: false,
});

// Module-level state
let initialized = false;
let initializationPromise = null;
let bitcoinConnectClient = null;

export async function initializeBitcoinConnect() {
  if (initialized) return bitcoinConnectClient;      // fast path

  if (initializationPromise) return initializationPromise; // someone else is already doing the work

  initializationPromise = (async () => {
    try {
      // Import the required modules
      const bc = await import('@getalby/bitcoin-connect-react');
      const sdkModule = await import('@getalby/sdk');
      
      // Initialize with the config options
      bc.init({
        appName: 'PlebDevs',
        filters: ['nwc'],
        showBalance: false,
      });
      
      // Store the client for use in components
      bitcoinConnectClient = bc.client;
      
      // Export NWC functionality directly
      if (!bitcoinConnectClient) {
        console.log('Creating backup NWC client instance');
        // Create fallback if client isn't available
        bitcoinConnectClient = {
          nwc: sdkModule.nwc,
          webln: sdkModule.webln
        };
      }
      
      initialized = true;
      console.log('Bitcoin Connect initialized successfully, client:', bitcoinConnectClient);
      return bitcoinConnectClient;
    } catch (error) {
      // If the error is about custom element already being defined, we can ignore it
      // as it means the component is already initialized
      if (!error.message?.includes('has already been defined as a custom element')) {
        console.error('Error initializing Bitcoin Connect:', error);
      }
      throw error;                                    // re-throw so callers see the failure
    } finally {
      initializationPromise = null;                   // allow retry after failure
    }
  })();

  return initializationPromise;
}

// Export the SDK for direct usage
export const getSDK = async () => {
  return import('@getalby/sdk');
};

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
