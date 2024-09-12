import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const NDKContext = createContext(null);

export const defaultRelayUrls = [
  "wss://nos.lol/",
  "wss://relay.damus.io/",
  "wss://relay.snort.social/",
  "wss://relay.nostr.band/",
  "wss://relay.mutinywallet.com/",
  "wss://relay.primal.net/",
  "wss://nostr21.com/",
  "wss://nostrue.com/",
  "wss://purplerelay.com/",
];

export const NDKProvider = ({ children }) => {
  const [ndk, setNdk] = useState(null);
  const [userRelays, setUserRelays] = useLocalStorage("userRelays", defaultRelayUrls);

  const createNDKInstance = (relays) => {
    const allRelays = [...new Set([...defaultRelayUrls, ...relays])];
    return new NDK({
      explicitRelayUrls: allRelays,
      enableOutboxModel: true,
      outboxRelayUrls: ["wss://nos.lol/"],
      cacheAdapter: new NDKCacheAdapterDexie({ dbName: 'ndk-cache' })
    });
  };

  useEffect(() => {
    setNdk(createNDKInstance(userRelays));
  }, [userRelays]);

  const reInitializeNDK = () => {
    const newInstance = createNDKInstance(userRelays);
    setNdk(newInstance);
  };

  const addSigner = async () => {
    if (ndk) {
      const nip07signer = new NDKNip07Signer();
      await ndk.signer?.user();
      ndk.signer = nip07signer;
    }
  };

  return (
    <NDKContext.Provider value={{ ndk, addSigner, reInitializeNDK, userRelays, setUserRelays }}>
      {children}
    </NDKContext.Provider>
  );
};

export const useNDKContext = () => {
  return useContext(NDKContext);
};