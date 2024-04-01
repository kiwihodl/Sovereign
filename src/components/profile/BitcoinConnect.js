"use client";
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const Button = dynamic(
  () => import('@getalby/bitcoin-connect-react').then((mod) => mod.Button),
  {
    ssr: false,
  }
);

const BitcoinConnectButton = () => {

  useEffect(() => {
    const initializeBitcoinConnect = async () => {
      // Initialize Bitcoin Connect
      const { init } = await import('@getalby/bitcoin-connect-react');
      init({
        appName: "PlebDevs",
        filters: ["nwc"],
        showBalance: false
      });
    };

    initializeBitcoinConnect();
  }, []); // Empty dependency array to run only once on component mount

  return (
    <Button onConnect={(provider) => {
      console.log('provider:', provider);
    }} />
  );
}

export default BitcoinConnectButton;
