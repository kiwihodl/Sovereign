import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';
import appConfig from '@/config/appConfig';

export function useDocuments() {
  const [isClient, setIsClient] = useState(false);
  const [documents, setDocuments] = useState();
  // Add new state variables for loading and error
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  const { contentIds } = useContentIdsQuery();
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
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      if (!contentIds || contentIds.length === 0) {
        setDocumentsLoading(false);
        return []; // Return early if no content IDs are found
      }

      await ndk.connect();

      const filter = { kinds: [30023, 30402], authors: appConfig.authorPubkeys };
      const events = await ndk.fetchEvents(filter);

      if (events && events.size > 0) {
        const eventsArray = Array.from(events);
        const documents = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
        setDocumentsLoading(false);
        return documents;
      }
      setDocumentsLoading(false);
      return [];
    } catch (error) {
      console.error('Error fetching documents from NDK:', error);
      setDocumentsError(error);
      setDocumentsLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (isClient && contentIds) {
      fetchDocumentsFromNDK().then(fetchedDocuments => {
        if (fetchedDocuments && fetchedDocuments.length > 0) {
          setDocuments(fetchedDocuments);
        }
      });
    }
  }, [isClient, contentIds]);

  return { documents, documentsLoading, documentsError };
}
