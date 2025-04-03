import React from 'react';
import BitcoinConnectButton from '@/components/bitcoinConnect/BitcoinConnect';

const BitcoinLightningCard = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 my-2 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <i className="pi pi-bolt text-yellow-500 text-2xl"></i>
        <h3 className="text-xl font-semibold">Lightning Wallet Connection</h3>
      </div>
      <p className="text-gray-400 mb-4">
        Connect your Lightning wallet for easier payments across the platform
      </p>
      <BitcoinConnectButton />
    </div>
  );
};

export default BitcoinLightningCard;
