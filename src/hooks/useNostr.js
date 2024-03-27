import { useState, useEffect, useRef } from "react";
import { SimplePool, nip19, verifyEvent, nip57 } from "nostr-tools";
import axios from "axios";
import { useToast } from "./useToast";

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
        streams: [],
        zaps: []
    });

    const { showToast } = useToast();

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
                onevent: async (event) => {
                    if (event.kind === 9735) {
                        console.log('event:', event);
                    }
                    const shouldInclude = await hasRequiredTags(event.tags);
                    if (shouldInclude) {
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

    // zaps
    // 1. get the author from the content
    // 2. get the author's kind0
    // 3. get the author's lud16 if available
    // 4. Make a get request to the lud16 endpoint and ensure that allowNostr is true
    // 5. Create zap request event and sign it
    // 6. Send to the callback url as a get req with the nostr event as a query param
    // 7. get the invoice back and pay it with webln
    // 8. listen for the zap receipt event and update the UI

    const zapEvent = async (event) => {
        const kind0 = await fetchKind0([{ authors: [event.pubkey], kinds: [0] }], {});

        if (Object.keys(kind0).length === 0) {
            console.error('Error fetching kind0');
            return;
        }

        if (kind0?.lud16) {
            const lud16Username = kind0.lud16.split('@')[0];
            const lud16Domain = kind0.lud16.split('@')[1];

            const lud16Url = `https://${lud16Domain}/.well-known/lnurlp/${lud16Username}`;

            const response = await axios.get(lud16Url);

            if (response.data.allowsNostr) {
                const zapReq = nip57.makeZapRequest({
                    profile: event.pubkey,
                    event: event.id,
                    amount: 1000,
                    relays: relays,
                    comment: 'Plebdevs Zap'
                });

                console.log('zapReq:', zapReq);

                const signedEvent = await window?.nostr.signEvent(zapReq);
                
                const callbackUrl = response.data.callback;

                const zapRequestAPICall = `${callbackUrl}?amount=${1000}&nostr=${encodeURI(JSON.stringify(signedEvent))}`;

                const invoiceResponse = await axios.get(zapRequestAPICall);

                if (invoiceResponse?.data?.pr) {
                    const invoice = invoiceResponse.data.pr;

                    const enabled = await window?.webln?.enable();

                    console.log('webln enabled:', enabled);

                    const payInvoiceResponse = await window?.webln?.sendPayment(invoice);

                    console.log('payInvoiceResponse:', payInvoiceResponse);
                } else {
                    console.error('Error fetching invoice');
                    showToast('error', 'Error', 'Error fetching invoice');
                }
            }
        } else if (kind0?.lud06) {
            // handle lnurlpay
        } else {
            showToast('error', 'Error', 'User has no Lightning Address or LNURL');
            return;
        }
    
    }

    const fetchZapsForEvent = async (eventId) => {
        const filter = [{ kinds: [9735] }];
        const hasRequiredTags = async (eventData) => {
            const hasEtag = eventData.some(([tag, value]) => tag === "e" && value === eventId);
            return hasEtag;
        };
        fetchEvents(filter, 'zaps', hasRequiredTags);
    }

    // Fetch resources, workshops, courses, and streams with appropriate filters and update functions
    const fetchResources = async () => {
        const filter = [{ kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"] }];
        const hasRequiredTags = async (eventData) => {
            const hasPlebDevs = eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
            const hasResource = eventData.some(([tag, value]) => tag === "t" && value === "resource");
            if (hasPlebDevs && hasResource) {
                const resourceId = eventData.find(([tag]) => tag === "d")?.[1];
                if (resourceId) {
                    try {
                        const response = await axios.get(`/api/resources/${resourceId}`);
                        return response.status === 200;
                    } catch (error) {
                        // Handle 404 or other errors gracefully
                        return false;
                    }
                }
            }
            return false;
        };
        fetchEvents(filter, 'resources', hasRequiredTags);
    };

    const fetchWorkshops = async () => {
        const filter = [{ kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"] }];
        const hasRequiredTags = async (eventData) => {
            const hasPlebDevs = eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
            const hasWorkshop = eventData.some(([tag, value]) => tag === "t" && value === "workshop");
            if (hasPlebDevs && hasWorkshop) {
                const workshopId = eventData.find(([tag]) => tag === "d")?.[1];
                if (workshopId) {
                   try {
                        const response = await axios.get(`/api/resources/${workshopId}`);
                        return response.status === 200;
                   } catch (error) {
                        // Handle 404 or other errors gracefully
                        return false;
                   }
                }
            }
            return false;
        };
        fetchEvents(filter, 'workshops', hasRequiredTags);
    };

    const fetchCourses = async () => {
        const filter = [{ kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"] }];
        const hasRequiredTags = async (eventData) => {
            const hasPlebDevs = eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
            const hasCourse = eventData.some(([tag, value]) => tag === "t" && value === "course");
            if (hasPlebDevs && hasCourse) {
                const courseId = eventData.find(([tag]) => tag === "d")?.[1];
                if (courseId) {
                    // try {
                    //     const response = await axios.get(`/api/resources/${courseId}`);
                    //     return response.status === 200;
                    // } catch (error) {
                    //     // Handle 404 or other errors gracefully
                    //     return false;
                    // }
                    return true;
                }
            }
            return false;
        };
        fetchEvents(filter, 'courses', hasRequiredTags);
    };

    // const fetchStreams = () => {
    //     const filter = [{kinds: [30311], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"]}];
    //     const hasRequiredTags = (eventData) => eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
    //     fetchEvents(filter, 'streams', hasRequiredTags);
    // }

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

            function timedout() {
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
                    showToast('success', `published to ${relays[i]}`)
                } else {
                    failedRelays.push(relays[i])
                    showToast('error', `failed to publish to ${relays[i]}`)
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
        // fetchStreams,
        zapEvent,
        fetchZapsForEvent,
        getRelayStatuses,
        events
    };
};