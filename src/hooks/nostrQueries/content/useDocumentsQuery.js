import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';
import axios from 'axios';
import appConfig from '@/config/appConfig';

export function useDocumentsQuery() {
  const [isClient, setIsClient] = useState(false);
  const { ndk, addSigner } = useNDKContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasRequiredProperties = (event, contentIds) => {
    const hasDocument = event.tags.some(([tag, value]) => tag === 't' && value === 'document');
    const hasId = event.tags.some(([tag, value]) => tag === 'd' && contentIds.includes(value));
    return hasDocument && hasId;
  };

  const fetchDocumentsFromNDK = async () => {
    try {
      const response = await axios.get(`/api/content/all`);
      const contentIds = response.data;

      if (!contentIds || contentIds.length === 0) {
        return []; // Return early if no content IDs are found
      }

      await ndk.connect();

      const filter = { kinds: [30023, 30402], authors: appConfig.authorPubkeys };
      const events = await ndk.fetchEvents(filter);

      if (events && events.size > 0) {
        const eventsArray = Array.from(events);
        const documents = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
        return documents;
      }
      return [];
    } catch (error) {
      console.error('Error fetching documents from NDK:', error);
      return [];
    }
  };

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['documents', isClient],
    queryFn: fetchDocumentsFromNDK,
    // staleTime: 1000 * 60 * 30, // 30 minutes
    // refetchInterval: 1000 * 60 * 30, // 30 minutes
    enabled: isClient,
  });

  return { documents, documentsLoading, documentsError, refetchDocuments };
}
