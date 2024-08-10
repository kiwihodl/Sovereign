import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const Button = dynamic(
  () => import('@getalby/bitcoin-connect-react').then((mod) => mod.Button),
  {
    ssr: false,
  }
);

let initialized = false;

export async function initializeBitcoinConnect() {
  if (!initialized) {
    const { init } = await import('@getalby/bitcoin-connect-react');
    init({
      appName: "PlebDevs",
      filters: ["nwc"],
      showBalance: false
    });
    initialized = true;
  }
}

const BitcoinConnectButton = () => {
  useEffect(() => {
    initializeBitcoinConnect();
  }, []);

  return (
    <Button onConnect={(provider) => {
      console.log('provider:', provider);
    }} />
  );
}

export default BitcoinConnectButton;