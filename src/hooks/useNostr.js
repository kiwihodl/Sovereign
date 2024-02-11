import { useState, useEffect, useRef } from "react";
import { SimplePool, relayInit, nip19 } from "nostr-tools";
import { useDispatch } from "react-redux";
import { initialRelays } from "@/redux/reducers/userReducer";

export const useNostr = () => {
    const [relays, setRelays] = useState(initialRelays);
    const [relayStatuses, setRelayStatuses] = useState({});

    const dispatch = useDispatch();

    const pool = useRef(new SimplePool({ seenOnEnabled: true }));
    const subscriptions = useRef([]);

    const getRelayStatuses = () => {
        if (pool.current && pool.current._conn) {
            const statuses = {};

            for (const url in pool.current._conn) {
                const relay = pool.current._conn[url];
                statuses[url] = relay.status; // Assuming 'status' is an accessible field in Relay object
            }

            setRelayStatuses(statuses);
        }
    };

    const updateRelays = async (newRelays) => {
        // Set new relays
        setRelays(newRelays);

        // Ensure the relays are connected before using them
        await Promise.all(newRelays.map(relay => pool.current.ensureRelay(relay)));
    };

    const fetchKind0 = async (criteria, params) => {
        return new Promise((resolve, reject) => {
            const events = [];
            const timeoutDuration = 1000;

            const sub = pool.current.subscribeMany(relays, criteria, {
                ...params,
                onevent: (event) => {
                    events.push(event);
                },
                onerror: (error) => {
                    reject(error);
                }
            });

            // Set a timeout to sort and resolve with the most recent event
            setTimeout(() => {
                if (events.length === 0) {
                    resolve(null);  // or reject based on your needs
                } else {
                    events.sort((a, b) => b.created_at - a.created_at); // Sort in descending order
                    const mostRecentEventContent = JSON.parse(events[0].content);
                    resolve(mostRecentEventContent);
                }
            }, timeoutDuration);
        });
    };

    const fetchSingleEvent = async (id) => {
        return new Promise((resolve, reject) => {
            const sub = pool.current.subscribeMany(relays, [{ ids: [id] }]);

            sub.on("event", (event) => {
                resolve(event);
            });

            sub.on("error", (error) => {
                reject(error);
            });
        });
    };

    const publishEvent = async (event) => {
        try {
            const publishPromises = pool.current.publish(relays, event);
            await Promise.all(publishPromises);
        } catch (error) {
            console.error("Error publishing event:", error);
        }
    };

    useEffect(() => {
        getRelayStatuses(); // Get initial statuses on mount

        // Copy current subscriptions to a local variable inside the effect
        const currentSubscriptions = subscriptions.current;

        return () => {
            // Use the local variable in the cleanup function
            currentSubscriptions.forEach((sub) => sub.unsub());
        };
    }, []);

    return {
        updateRelays,
        fetchSingleEvent,
        publishEvent,
        fetchKind0,
        getRelayStatuses,
    };
};