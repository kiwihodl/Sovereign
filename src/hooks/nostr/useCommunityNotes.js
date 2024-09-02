import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';

export function useCommunityNotes() {
    const [isClient, setIsClient] = useState(false);
    const [communityNotes, setCommunityNotes] = useState();
    // Add new state variables for loading and error
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const {ndk, addSigner} = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchCommunityNotesFromNDK = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await ndk.connect();

            const filter = { kinds: [1], "#t": ["plebdevs"] };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                setCommunityNotes(eventsArray);
                setIsLoading(false);
                return eventsArray;
            }
            setIsLoading(false);
            return [];
        } catch (error) {
            console.error('Error fetching community notes from NDK:', error);
            setError(error);
            setIsLoading(false);
            return [];
        }
    };

    useEffect(() => {
        if (isClient) {
            fetchCommunityNotesFromNDK().then(fetchedCommunityNotes => {
                if (fetchedCommunityNotes && fetchedCommunityNotes.length > 0) {
                    setCommunityNotes(fetchedCommunityNotes);
                }
            });
        }
    }, [isClient]);

    return { communityNotes, isLoading, error };
}