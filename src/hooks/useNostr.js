import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { nip57, nip19 } from 'nostr-tools';
import { NostrContext } from '@/context/NostrContext';
import { lnurlEncode } from '@/utils/lnurl';

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
    const pool = useContext(NostrContext);

    const subscribe = useCallback(
        (filters, opts) => {
            if (!pool) return;

            return pool.subscribeMany(defaultRelays, filters, opts);
        },
        [pool]
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
        async (event) => {
            try {
                let zaps = [];
                const paramaterizedFilter = { kinds: [9735], '#a': [`${event.kind}:${event.id}:${event.d}`] };
                const paramaterizedZaps = await pool.querySync(defaultRelays, paramaterizedFilter);
                console.log('paramaterizedZaps:', paramaterizedZaps);
                const filter = { kinds: [9735], '#e': [event.id] };
                const zapsForEvent = await pool.querySync(defaultRelays, filter);
                console.log('zapsForEvent:', zapsForEvent);
                zaps = zaps.concat(paramaterizedZaps, zapsForEvent);
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
                const filter = { authors: [publicKey], kinds: [0] };
                const kind0 = await pool.querySync(defaultRelays, filter);
                return JSON.parse(kind0[0].content);
            } catch (error) {
                console.error('Failed to fetch kind 0 for event:', error);
                return [];
            }
        },
        [pool]
    );

    const zapEvent = useCallback(
        async (event, amount, comment) => {
            const kind0 = await fetchKind0(event.pubkey);

            if (kind0.length === 0) {
                console.error('Error fetching kind0');
                return;
            }

            if (kind0.lud16) {
                const lud16Username = kind0.lud16.split('@')[0];
                const lud16Domain = kind0.lud16.split('@')[1];
                const lud16Url = `https://${lud16Domain}/.well-known/lnurlp/${lud16Username}`;

                try {
                    const response = await axios.get(lud16Url);

                    if (response.data.allowsNostr) {
                        const zapReq = nip57.makeZapRequest({
                            profile: event.pubkey,
                            event: event.id,
                            amount: amount,
                            relays: defaultRelays,
                            comment: comment ? comment : 'Plebdevs Zap',
                        });

                        const user = window.localStorage.getItem('user');

                        const pubkey = JSON.parse(user).pubkey;

                        const lnurl = lnurlEncode(lud16Url)

                        console.log('lnurl:', lnurl);

                        console.log('pubkey:', pubkey);

                        // const zapRequest = {
                        //     kind: 9734,
                        //     content: "",
                        //     tags: [
                        //         ["relays", defaultRelays[4], defaultRelays[5]],
                        //         ["amount", amount.toString()],
                        //         //   ["lnurl", lnurl],
                        //         ["e", event.id],
                        //         ["p", event.pubkey],
                        //         // ["a", `${event.kind}:${event.id}:${event.d}`],
                        //     ],
                        //     created_at: Math.floor(Date.now() / 1000)
                        // }

                        console.log('zapRequest:', zapReq);

                        const signedEvent = await window?.nostr?.signEvent(zapReq);
                        console.log('signedEvent:', signedEvent);
                        const callbackUrl = response.data.callback;
                        const zapRequestAPICall = `${callbackUrl}?amount=${amount}&nostr=${encodeURI(
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

    return { subscribe, publish, fetchSingleEvent, fetchZapsForEvent, fetchKind0, fetchResources, fetchWorkshops, fetchCourses, zapEvent };
}