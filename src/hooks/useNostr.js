import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SimplePool, nip57 } from 'nostr-tools';

const defaultRelays = [
    "wss://nos.lol/",
    "wss://relay.damus.io/",
    "wss://relay.snort.social/",
    "wss://relay.nostr.band/",
    "wss://nostr.mutinywallet.com/",
    "wss://relay.mutinywallet.com/",
    "wss://relay.primal.net/"
];

export function useNostr() {
    const [pool, setPool] = useState(null);

    useEffect(() => {
        const newPool = new SimplePool({ verifyEvent: () => true });
        setPool(newPool);

        return () => {
            newPool.close(defaultRelays);
        };
    }, []);

    const connect = useCallback(async () => {
        if (!pool) return;

        try {
            await Promise.all(defaultRelays.map((url) => pool.ensureRelay(url)));
        } catch (error) {
            console.error('Error connecting to relays:', error);
        }
    }, [pool]);

    const disconnect = useCallback(() => {
        if (!pool) return;

        pool.close(defaultRelays);
    }, [pool]);

    const subscribe = useCallback(
        (filters, opts) => {
            if (!pool) return;

            return pool.subscribeMany(defaultRelays, filters, {
                ...opts,
                onclose: () => {
                    opts.onclose?.();
                    connect();
                },
            });
        },
        [pool, connect]
    );

    const publish = useCallback(
        async (event) => {
            if (!pool) return;

            try {
                await Promise.any(pool.publish(defaultRelays, event));
                console.log('Published event to at least one relay');
            } catch (error) {
                console.error('Failed to publish event:', error);
            }
        },
        [pool]
    );

    const fetchSingleEvent = useCallback(
        async (id) => {
            try {
                if (!pool || !pool.connected) {
                    console.warn('Pool is not connected. Skipping fetchSingleEvent.');
                    return null;
                }
    
                const event = await pool.get(defaultRelays, {
                    ids: [id],
                });
                return event;
            } catch (error) {
                console.error('Failed to fetch event:', error);
                return null;
            }
        },
        [pool]
    );

    const fetchZapsForEvent = useCallback(
        async (id) => {
            try {
                if (!pool || !pool.connected) {
                    console.warn('Pool is not connected. Skipping fetchZapsForEvent.');
                    return [];
                }
    
                const filter = [{ kinds: [9735], '#e': [id] }];
                const zaps = await pool.querySync(defaultRelays, filter);
                console.log('zaps:', zaps);
                return zaps;
            } catch (error) {
                console.error('Failed to fetch zaps for event:', error);
                return [];
            }
        },
        [pool]
    );

    const fetchKind0 = useCallback(
        async (publicKey) => {
            try {
                if (!pool || !pool.connected) {
                    console.warn('Pool is not connected. Skipping fetchKind0.');
                    return [];
                }
                
                const filter = [{ authors: [publicKey], kinds: [0] }];
                const kind0 = await pool.querySync(defaultRelays, filter);
                return kind0;
            } catch (error) {
                console.error('Failed to fetch kind 0 for event:', error);
                return [];
            }
        },
        [pool]
    );

    const zapEvent = useCallback(
        async (event) => {
            const kind0 = await fetchKind0(event.pubkey);

            if (kind0.length === 0) {
                console.error('Error fetching kind0');
                return;
            }

            const profile = kind0[0];

            if (profile.lud16) {
                const lud16Username = profile.lud16.split('@')[0];
                const lud16Domain = profile.lud16.split('@')[1];
                const lud16Url = `https://${lud16Domain}/.well-known/lnurlp/${lud16Username}`;

                try {
                    const response = await axios.get(lud16Url);

                    if (response.data.allowsNostr) {
                        const zapReq = nip57.makeZapRequest({
                            profile: event.pubkey,
                            event: event.id,
                            amount: 1000,
                            relays: defaultRelays,
                            comment: 'Plebdevs Zap',
                        });

                        console.log('zapReq:', zapReq);

                        const signedEvent = await window?.nostr?.signEvent(zapReq);
                        const callbackUrl = response.data.callback;
                        const zapRequestAPICall = `${callbackUrl}?amount=${1000}&nostr=${encodeURI(
                            JSON.stringify(signedEvent)
                        )}`;

                        const invoiceResponse = await axios.get(zapRequestAPICall);

                        if (invoiceResponse?.data?.pr) {
                            const invoice = invoiceResponse.data.pr;
                            const enabled = await window?.webln?.enable();
                            console.log('webln enabled:', enabled);
                            const payInvoiceResponse = await window?.webln?.sendPayment(invoice);
                            console.log('payInvoiceResponse:', payInvoiceResponse);
                        } else {
                            console.error('Error fetching invoice');
                            // showToast('error', 'Error', 'Error fetching invoice');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching lud16 data:', error);
                }
            } else if (profile.lud06) {
                // handle lnurlpay
            } else {
                // showToast('error', 'Error', 'User has no Lightning Address or LNURL');
            }
        },
        [fetchKind0]
    );

    const fetchResources = useCallback(async () => {
        const filter = [{ kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"] }];
        const hasRequiredTags = (eventData) => {
            const hasPlebDevs = eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
            const hasResource = eventData.some(([tag, value]) => tag === "t" && value === "resource");
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
                        subscription?.close();
                        resolve(resources);
                    },
                    onclose: () => {
                        resolve(resources);
                    },
                },
                2000 // Adjust the timeout value as needed
            );
    
            setTimeout(() => {
                subscription?.close();
                resolve(resources);
            }, 2000); // Adjust the timeout value as needed
        });
    }, [subscribe]);
    
    const fetchWorkshops = useCallback(async () => {
        const filter = [{ kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"] }];
        const hasRequiredTags = (eventData) => {
            const hasPlebDevs = eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
            const hasWorkshop = eventData.some(([tag, value]) => tag === "t" && value === "workshop");
            return hasPlebDevs && hasWorkshop;
        };
    
        return new Promise((resolve, reject) => {
            let workshops = [];
    
            const subscription = subscribe(
                filter,
                {
                    onevent: (event) => {
                        if (hasRequiredTags(event.tags)) {
                            workshops.push(event);
                        }
                    },
                    onerror: (error) => {
                        console.error('Error fetching workshops:', error);
                        subscription?.close();
                        resolve(workshops);
                    },
                    onclose: () => {
                        resolve(workshops);
                    },
                },
                2000 // Adjust the timeout value as needed
            );
    
            setTimeout(() => {
                subscription?.close();
                resolve(workshops);
            }, 2000); // Adjust the timeout value as needed
        });
    }, [subscribe]);
    
    const fetchCourses = useCallback(async () => {
        const filter = [{ kinds: [30023], authors: ["f33c8a9617cb15f705fc70cd461cfd6eaf22f9e24c33eabad981648e5ec6f741"] }];
        const hasRequiredTags = (eventData) => {
            const hasPlebDevs = eventData.some(([tag, value]) => tag === "t" && value === "plebdevs");
            const hasCourse = eventData.some(([tag, value]) => tag === "t" && value === "course");
            return hasPlebDevs && hasCourse;
        };
    
        return new Promise((resolve, reject) => {
            let courses = [];
    
            const subscription = subscribe(
                filter,
                {
                    onevent: (event) => {
                        if (hasRequiredTags(event.tags)) {
                            courses.push(event);
                        }
                    },
                    onerror: (error) => {
                        console.error('Error fetching courses:', error);
                        subscription?.close();
                        resolve(courses);
                    },
                    onclose: () => {
                        resolve(courses);
                    },
                },
                2000 // Adjust the timeout value as needed
            );
    
            setTimeout(() => {
                subscription?.close();
                resolve(courses);
            }, 2000); // Adjust the timeout value as needed
        });
    }, [subscribe]);

    return { subscribe, publish, fetchSingleEvent, fetchZapsForEvent, fetchResources, fetchWorkshops, fetchCourses, zapEvent };
}