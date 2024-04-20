import { createContext, useState, useEffect } from 'react';
import { SimplePool } from 'nostr-tools';

const defaultRelays = [
  "wss://nos.lol/",
  "wss://relay.damus.io/",
  "wss://relay.snort.social/",
  "wss://relay.nostr.band/",
  "wss://nostr.mutinywallet.com/",
  "wss://relay.mutinywallet.com/",
  "wss://relay.primal.net/"
];

export const NostrContext = createContext();

export const NostrProvider = ({ children }) => {
  const [pool, setPool] = useState(null);

  useEffect(() => {
    const newPool = new SimplePool({ verifyEvent: () => true });
    setPool(newPool);

    const connectRelays = async () => {
      try {
        await Promise.all(defaultRelays.map((url) => newPool.ensureRelay(url)));
      } catch (error) {
        console.error('Error connecting to relays:', error);
      }
    };

    connectRelays();

    return () => {
      newPool.close(defaultRelays);
    };
  }, []);

  return (
    <NostrContext.Provider value={pool}>
      {children}
    </NostrContext.Provider>
  );
};