import { useState, useEffect } from 'react';
import { useNDKContext } from "@/context/NDKContext";

export function useZapsSubscription({event}) {
  const [zaps, setZaps] = useState([]);
  const [zapsLoading, setZapsLoading] = useState(true);
  const [zapsError, setZapsError] = useState(null);
  const ndk = useNDKContext();

  useEffect(() => {
    let subscription;
    let isFirstZap = true;
    const zapIds = new Set(); // To keep track of zap IDs we've already seen

    async function subscribeToZaps() {
      try {
        const filters = [
          { kinds: [9735], "#e": [event.id] },
          { kinds: [9735], "#a": [`${event.kind}:${event.id}:${event.d}`] }
        ];
        await ndk.connect();
        console.log("filters", filters);
        subscription = ndk.subscribe(filters);

        subscription.on('event', (zapEvent) => {
          console.log("event", zapEvent);
          
          // Check if we've already seen this zap
          if (!zapIds.has(zapEvent.id)) {
            zapIds.add(zapEvent.id);
            setZaps((prevZaps) => [...prevZaps, zapEvent]);

            if (isFirstZap) {
              setZapsLoading(false);
              isFirstZap = false;
            }
          }
        });

        subscription.on('eose', () => {
          console.log("eose");
          // Only set loading to false if no zaps have been received yet
          if (isFirstZap) {
            setZapsLoading(false);
          }
        });

        await subscription.start();
      } catch (error) {
        console.error("Error subscribing to zaps:", error);
        setZapsError(error.message);
        setZapsLoading(false);
      }
    }

    if (event && Object.keys(event).length > 0) {
      subscribeToZaps();
    }

    return () => {
      if (subscription) {
        subscription.stop();
      }
    };
  }, [event, ndk]);

  return { zaps, zapsLoading, zapsError };
}