import { useState, useEffect, useRef } from "react";
import { SimplePool, nip19, verifyEvent } from "nostr-tools";
import { Relay } from 'nostr-tools/relay'

const initialRelays = [
    "wss://nos.lol/",
    "wss://relay.damus.io/",
    "wss://relay.snort.social/",
    "wss://relay.nostr.band/",
    "wss://nostr.mutinywallet.com/",
    "wss://relay.mutinywallet.com/",
    "wss://relay.primal.net/"
];

export const useNostr = () => {
    const [relays, setRelays] = useState(initialRelays);
    const [relayStatuses, setRelayStatuses] = useState({});
    const [events, setEvents] = useState({
        resources: [],
        workshops: [],
        courses: [],
        streams: []
    });

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

    const fetchEvents = async (filter, updateDataField, hasRequiredTags) => {
        try {
            const sub = pool.current.subscribeMany(relays, filter, {
                onevent: (event) => {
                    if (hasRequiredTags(event.tags)) {
                        setEvents(prevData => ({
                            ...prevData,
                            [updateDataField]: [...prevData[updateDataField], event]
                        }));
                    }
                },
                onerror: (error) => {
                    setError(error);
                    console.error(`Error fetching ${updateDataField}:`, error);
                },
                oneose: () => {
                    console.log("Subscription closed");
                    sub.close();
                }
            });
        } catch (error) {
            setError(error);
        }
    };

    // Fetch resources, workshops, courses, and streams with appropriate filters and update functions
    const fetchResources = () => {
        const filter = [{kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"]}];
        const hasRequiredTags = (eventData) => eventData.some(([tag, value]) => tag === "t" && value === "plebdevs") && eventData.some(([tag, value]) => tag === "t" && value === "resource");
        fetchEvents(filter, 'resources', hasRequiredTags);
    };

    const fetchWorkshops = () => {
        const filter = [{kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"]}];
        const hasRequiredTags = (eventData) => eventData.some(([tag, value]) => tag === "t" && value === "plebdevs") && eventData.some(([tag, value]) => tag === "t" && value === "resource");
        fetchEvents(filter, 'workshops', hasRequiredTags);
    }

    const fetchCourses = () => {
        const filter = [{kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"]}];
        const hasRequiredTags = (eventData) => eventData.some(([tag, value]) => tag === "t" && value === "plebdevs") && eventData.some(([tag, value]) => tag === "t" && value === "course");
        fetchEvents(filter, 'courses', hasRequiredTags);
    }

    const fetchStreams = () => {
        const filter = [{kinds: [30311], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"]}];
        const hasRequiredTags = (eventData) => eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
        fetchEvents(filter, 'streams', hasRequiredTags);
    }

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
            const sub = pool.current.subscribeMany(relays, [{ ids: [id] }], {
                onevent: (event) => {
                    resolve(event);
                },
                onerror: (error) => {
                    reject(error);
                },
                oneose: () => {
                    console.log("Subscription closed");
                    sub.close();
                }
            });
        });
    }

    const publishEvent = async (relay, signedEvent) => {
        console.log('publishing event to', relay);
        return new Promise((resolve, reject) => {
            const timeout = 3000
            const wsRelay = new window.WebSocket(relay)
            let timer
            let isMessageSentSuccessfully = false
        
            function timedout () {
              clearTimeout(timer)
              wsRelay.close()
              reject(new Error(`relay timeout for ${relay}`))
            }
        
            timer = setTimeout(timedout, timeout)
        
            wsRelay.onopen = function () {
              clearTimeout(timer)
              timer = setTimeout(timedout, timeout)
              wsRelay.send(JSON.stringify(['EVENT', signedEvent]))
            }
        
            wsRelay.onmessage = function (msg) {
              const m = JSON.parse(msg.data)
              if (m[0] === 'OK') {
                isMessageSentSuccessfully = true
                clearTimeout(timer)
                wsRelay.close()
                console.log('Successfully sent event to', relay)
                resolve()
              }
            }
        
            wsRelay.onerror = function (error) {
              clearTimeout(timer)
              console.log(error)
              reject(new Error(`relay error: Failed to send to ${relay}`))
            }
        
            wsRelay.onclose = function () {
              clearTimeout(timer)
              if (!isMessageSentSuccessfully) {
                reject(new Error(`relay error: Failed to send to ${relay}`))
              }
            }
          })
    };


    const publishAll = async (signedEvent) => {
        try {
            const promises = relays.map(relay => publishEvent(relay, signedEvent));
            const results = await Promise.allSettled(promises)
            const successfulRelays = []
            const failedRelays = []

            results.forEach((result, i) => {
                if (result.status === 'fulfilled') {
                    successfulRelays.push(relays[i])
                } else {
                    failedRelays.push(relays[i])
                }
            })

            return { successfulRelays, failedRelays }
        } catch (error) {
            console.error('Error publishing event:', error);
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
        publishAll,
        fetchKind0,
        fetchResources,
        fetchCourses,
        fetchWorkshops,
        fetchStreams,
        getRelayStatuses,
        events
    };
};