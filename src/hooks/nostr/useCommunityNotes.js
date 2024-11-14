import { useState, useEffect, useCallback } from 'react';
import { useNDKContext } from '@/context/NDKContext';
import { NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";

export function useCommunityNotes() {
    const [communityNotes, setCommunityNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { ndk } = useNDKContext();

    const addNote = useCallback((noteEvent) => {
        setCommunityNotes((prevNotes) => {
            if (prevNotes.some(note => note.id === noteEvent.id)) return prevNotes;
            const newNotes = [noteEvent, ...prevNotes];
            newNotes.sort((a, b) => b.created_at - a.created_at);
            return newNotes;
        });
    }, []);

    useEffect(() => {
        let subscription;
        const noteIds = new Set();
        let timeoutId;

        async function subscribeToNotes() {
            if (!ndk) return;

            try {
                await ndk.connect();

                const filter = {
                    kinds: [1],
                    '#t': ['plebdevs']
                };

                subscription = ndk.subscribe(filter, {
                    closeOnEose: false,
                    cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST
                });

                subscription.on('event', (noteEvent) => {
                    if (!noteIds.has(noteEvent.id)) {
                        noteIds.add(noteEvent.id);
                        addNote(noteEvent);
                        setIsLoading(false);
                        clearTimeout(timeoutId);
                    }
                });

                subscription.on('close', () => {
                    setIsLoading(false);
                });

                subscription.on('eose', () => {
                    setIsLoading(false);
                });

                await subscription.start();

                // Set a 4-second timeout to stop loading state if no notes are received
                timeoutId = setTimeout(() => {
                    setIsLoading(false);
                }, 4000);

            } catch (err) {
                console.error('Error subscribing to notes:', err);
                setError(err.message);
                setIsLoading(false);
            }
        }

        setCommunityNotes([]);
        setIsLoading(true);
        setError(null);
        subscribeToNotes();

        return () => {
            if (subscription) {
                subscription.stop();
            }
            clearTimeout(timeoutId);
        };
    }, [ndk, addNote]);

    return { communityNotes, isLoading, error };
}