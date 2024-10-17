import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import appConfig from "@/config/appConfig";

const NDKContext = createContext(null);

const readOnlyRelays = ["wss://nostr21.com/", "wss://nostr.wine/", "wss://yestr.me/", "wss://lightningrelay.com/", "wss://nostr.land/", "wss://us.nostr.land", "wss://relay.keychat.io"];

export const NDKProvider = ({ children }) => {
  const [ndk, setNdk] = useState(null);
  // todo: remove this after testing phase
  // const [userRelays, setUserRelays] = useLocalStorage("userRelays", appConfig.defaultRelayUrls);
  const [userRelays, setUserRelays] = useState([...readOnlyRelays, "wss://relay.devs.tools"]);

  const createNDKInstance = (relays) => {
    const allRelays = [...new Set([...appConfig.defaultRelayUrls, ...relays])];
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