import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY

export function useResourcesQuery() {
    const [isClient, setIsClient] = useState(false);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

const hasRequiredTags = (tags) => {
  const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
  const hasWorkshop = tags.some(([tag, value]) => tag === "t" && value === "resource");
  return hasPlebDevs && hasWorkshop;
};

const fetchResourcesFromNDK = async () => {
  try {
      console.log('Fetching workshops from NDK');
      await ndk.connect();

      const filter = { kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] };
      const events = await ndk.fetchEvents(filter);

      if (events && events.size > 0) {
          const eventsArray = Array.from(events);
          console.log('eventsArray', eventsArray)
          const resources = eventsArray.filter(event => hasRequiredTags(event.tags));
          return resources;
      }
      return [];
  } catch (error) {
      console.error('Error fetching workshops from NDK:', error);
      return [];
  }
};

const { data: resources, isLoading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useQuery({
    queryKey: ['resources', isClient],
    queryFn: fetchResourcesFromNDK,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
    enabled: isClient,
  })

  return { resources, resourcesLoading, resourcesError, refetchResources }
}