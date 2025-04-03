import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';

export function useZapsQuery({ event, type }) {
  const [isClient, setIsClient] = useState(false);
  const { ndk, addSigner } = useNDKContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchZaps = async event => {
    try {
      await ndk.connect();

      const filters = [
        { kinds: [9735], '#e': [event.id] },
        { kinds: [9735], '#a': [`${event.kind}:${event.pubkey}:${event.d}`] },
      ];

      const events = await ndk.fetchEvents(filters, { closeOnEose: true });
      return events;
    } catch (error) {
      console.error('Error fetching zaps from NDK:', error);
      return [];
    }
  };

  const {
    data: zaps,
    isLoading: zapsLoading,
    error: zapsError,
    refetch: refetchZaps,
  } = useQuery({
    queryKey: ['zaps', isClient, event, type],
    queryFn: async () => await fetchZaps(event),
    staleTime: 10000, // 10 seconds
    refetchInterval: 10000, // 10 seconds
    enabled: isClient,
  });

  return { zaps, zapsLoading, zapsError, refetchZaps };
}
