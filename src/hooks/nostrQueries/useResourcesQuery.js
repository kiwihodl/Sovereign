import { useState, useEffect } from 'react';
import { useNostr } from '@/hooks/useNostr';
import { useQuery } from '@tanstack/react-query';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY

export function useResourcesQuery() {
    const [isClient, setIsClient] = useState(false);
    const { subscribe } = useNostr();

    useEffect(() => {
        setIsClient(true);
    }, []);

const fetchResources = async () => {
    console.log('fetching resources');
    const filter = [{ kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] }];
    const hasRequiredTags = (tags) => {
      const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
      const hasResource = tags.some(([tag, value]) => tag === "t" && value === "resource");
      return hasPlebDevs && hasResource;
    };

    return new Promise((resolve, reject) => {
      let resources = [];
      const subscription = subscribe(
        filter,
        {
          onevent: (event) => {
            if (hasRequiredTags(event.tags)) {
              resources.push(event);
            }
          },
          onerror: (error) => {
            console.error('Error fetching resources:', error);
            reject(error);
          },
          onclose: () => {
            resolve(resources);
          },
        }
      );

      // Set a timeout to resolve the promise after collecting events
      setTimeout(() => {
        subscription?.close();
        resolve(resources);
      }, 2000); // Adjust the timeout value as needed
    });
  }

const { data: resources, isLoading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useQuery({
    queryKey: ['resources', isClient],
    queryFn: fetchResources,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: isClient,
  })

  return { resources, resourcesLoading, resourcesError, refetchResources }
}