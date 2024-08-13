import React, { createContext, useContext, useEffect, useState } from 'react';
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

const NDKContext = createContext(null);

const relayUrls = [
  "wss://nos.lol/",
  "wss://relay.damus.io/",
  "wss://relay.snort.social/",
  "wss://relay.nostr.band/",
  "wss://nostr.mutinywallet.com/",
  "wss://relay.mutinywallet.com/",
  "wss://relay.primal.net/"
];

export const NDKProvider = ({ children }) => {
  const [ndk, setNdk] = useState(null);

  useEffect(() => {
    const instance = new NDK({ explicitRelayUrls: relayUrls });
    setNdk(instance);
  }, []);

  const addSigner = async () => {
    if (ndk) {
      const nip07signer = new NDKNip07Signer();
      await ndk.signer?.user();
      ndk.signer = nip07signer;
    }
  };

  return (
    <NDKContext.Provider value={{ ndk, addSigner }}>
      {children}
    </NDKContext.Provider>
  );
};

export const useNDKContext = () => {
  return useContext(NDKContext);
};