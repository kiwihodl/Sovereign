import { useState, useEffect, useCallback, useContext, useRef } from 'react';
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

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useNostr() {
    const pool = useContext(NostrContext);
    const subscriptionQueue = useRef([]);
    const lastSubscriptionTime = useRef(0);
    const throttleDelay = 2000;

    const processSubscriptionQueue = useCallback(() => {
        if (subscriptionQueue.current.length === 0) return;

        const currentTime = Date.now();
        if (currentTime - lastSubscriptionTime.current < throttleDelay) {
            setTimeout(processSubscriptionQueue, throttleDelay);
            return;
        }

        const subscription = subscriptionQueue.current.shift();
        subscription();

        lastSubscriptionTime.current = currentTime;
        setTimeout(processSubscriptionQueue, throttleDelay);
    }, [throttleDelay]);

    const subscribe = useCallback(
        (filters, opts) => {
            if (!pool) return;

            const subscriptionFn = () => {
                return pool.subscribeMany(defaultRelays, filters, opts);
            };

            subscriptionQueue.current.push(subscriptionFn);
            processSubscriptionQueue();
        },
        [pool, processSubscriptionQueue]
    );

    const publish = useCallback(
        async (event) => {
            if (!pool) return;

            try {
                await Promise.any(pool.publish(defaultRelays, event));
                console.log('Published event to at least one relay');
                return true;
            } catch (error) {
                console.error('Failed to publish event:', error);
                return false;
            }
        },
        [pool]
    );

    const fetchSingleEvent = useCallback(
        async (id) => {
            try {
                const event = await new Promise((resolve, reject) => {
                    subscribe(
                        [{ ids: [id] }],
                        {
                            onevent: (event) => {
                                resolve(event);
                            },
                            onerror: (error) => {
                                reject(error);
                            },
                        }
                    );
                });
                return event;
            } catch (error) {
                console.error('Failed to fetch event:', error);
                return null;
            }
        },
        [subscribe]
    );

    const querySyncQueue = useRef([]);
    const lastQuerySyncTime = useRef(0);

    const processQuerySyncQueue = useCallback(() => {
        if (querySyncQueue.current.length === 0) return;

        const currentTime = Date.now();
        if (currentTime - lastQuerySyncTime.current < throttleDelay) {
            setTimeout(processQuerySyncQueue, throttleDelay);
            return;
        }

        const querySync = querySyncQueue.current.shift();
        querySync();

        lastQuerySyncTime.current = currentTime;
        setTimeout(processQuerySyncQueue, throttleDelay);
    }, [throttleDelay]);

    const fetchZapsForParamaterizedEvent = useCallback(
        async (kind, id, d) => {
            try {
                const filters = { kinds: [9735], '#a': [`${kind}:${id}:${d}`] };
                const zaps = await pool.querySync(defaultRelays, filters);
                return zaps;
            } catch (error) {
                console.error('Failed to fetch zaps for event:', error);
                return [];
            }
        },
        [pool]
    );

    const fetchZapsForNonParameterizedEvent = useCallback(
        async (id) => {
            try {
                const filters = { kinds: [9735], '#e': [id] };
                const zaps = await pool.querySync(defaultRelays, filters);
                return zaps;
            } catch (error) {
                console.error('Failed to fetch zaps for event:', error);
                return [];
            }
        },
        [pool]
    );

    const fetchZapsForEvent = useCallback(
        async (event) => {
            const querySyncFn = async () => {
                try {
                    const parameterizedZaps = await fetchZapsForParamaterizedEvent(event.kind, event.id, event.d);
                    const nonParameterizedZaps = await fetchZapsForNonParameterizedEvent(event.id);
                    return [...parameterizedZaps, ...nonParameterizedZaps];
                } catch (error) {
                    console.error('Failed to fetch zaps for event:', error);
                    return [];
                }
            };

            return new Promise((resolve) => {
                querySyncQueue.current.push(async () => {
                    const zaps = await querySyncFn();
                    resolve(zaps);
                });
                processQuerySyncQueue();
            });
        },
        [fetchZapsForParamaterizedEvent, fetchZapsForNonParameterizedEvent, processQuerySyncQueue]
    );

    const fetchZapsForEvents = useCallback(
        async (events) => {
            const querySyncFn = async () => {
                try {
                    // Collect all #a and #e tag values from the list of events
                    let aTags = [];
                    let aTagsAlt = [];
                    let eTags = [];
                    events.forEach(event => {
                        aTags.push(`${event.kind}:${event.id}:${event.d}`);
                        aTagsAlt.push(`${event.kind}:${event.pubkey}:${event.d}`);
                        eTags.push(event.id);
                    });

                    // Create filters for batch querying
                    const filterA = { kinds: [9735], '#a': aTags };
                    const filterE = { kinds: [9735], '#e': eTags };
                    const filterAAlt = { kinds: [9735], '#a': aTagsAlt };

                    // Perform batch queries
                    // const [zapsA, zapsE] = await Promise.all([
                    //     pool.querySync(defaultRelays, filterA),
                    //     pool.querySync(defaultRelays, filterE)
                    // ]);
                    let allZaps = []

                    await new Promise((resolve) => pool.subscribeMany(defaultRelays, [filterA, filterE, filterAAlt], {
                        onerror: (error) => {
                            console.error('Failed to fetch zaps for events:', error);
                            resolve([]);
                        },
                        onevent: (event) => {
                            allZaps.push(event);
                        },
                        oneose: () => {
                            resolve(allZaps);
                        }
                    }))

                    // remove any duplicates
                    allZaps = allZaps.filter((zap, index, self) => index === self.findIndex((t) => (
                        t.id === zap.id
                    )))

                    return allZaps;
                } catch (error) {
                    console.error('Failed to fetch zaps for events:', error);
                    return [];
                }
            };

            return new Promise((resolve) => {
                querySyncQueue.current.push(async () => {
                    const zaps = await querySyncFn();
                    resolve(zaps);
                });
                processQuerySyncQueue();
            });
        },
        [pool, processQuerySyncQueue]
    );

    const fetchKind0 = useCallback(
        async (publicKey) => {
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              resolve(null); // Resolve with null if no event is received within the timeout
            }, 10000); // 10 seconds timeout
      
            subscribe(
              [{ authors: [publicKey], kinds: [0] }],
              {
                onevent: (event) => {
                  clearTimeout(timeout);
                  resolve(JSON.parse(event.content));
                },
                onerror: (error) => {
                  clearTimeout(timeout);
                  console.error('Error fetching kind 0:', error);
                  resolve(null);
                },
              }
            );
          });
        },
        [subscribe]
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
                        // const zapReq = nip57.makeZapRequest({
                        //     profile: event.pubkey,
                        //     event: event.id,
                        //     amount: amount,
                        //     relays: defaultRelays,
                        //     comment: comment ? comment : 'Plebdevs Zap',
                        // });

                        const user = window.localStorage.getItem('user');

                        const pubkey = JSON.parse(user).pubkey;

                        const lnurl = lnurlEncode(lud16Url)

                        console.log('lnurl:', lnurl);

                        console.log('pubkey:', pubkey);

                        const zapReq = {
                            kind: 9734,
                            content: "",
                            tags: [
                                ["relays", defaultRelays.join(",")],
                                ["amount", amount.toString()],
                                //   ["lnurl", lnurl],
                                ["e", event.id],
                                ["p", event.pubkey],
                                ["a", `${event.kind}:${event.pubkey}:${event.d}`],
                            ],
                            created_at: Math.floor(Date.now() / 1000)
                        }

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
                showToast('error', 'Error', 'User has no Lightning Address or LNURL');
            }
        },
        [fetchKind0]
    );

    const fetchResources = useCallback(async () => {
        const filter = [{ kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] }];
        const hasRequiredTags = (tags) => {
            const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
            // Check if 'resource' tag exists
            const hasResource = tags.some(([tag, value]) => tag === "t" && value === "resource");
            // Return true if both tags exist
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
        const filter = [{ kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] }];
        const hasRequiredTags = (tags) => {
            const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");

            const hasWorkshop = tags.some(([tag, value]) => tag === "t" && value === "workshop");

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
        const filter = [{ kinds: [30023], authors: [AUTHOR_PUBKEY] }];
        const hasRequiredTags = (tags) => {
            const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");

            const hasCourse = tags.some(([tag, value]) => tag === "t" && value === "course");

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

    const publishResource = useCallback(
        async (resourceEvent) => {
          const published = await publish(resourceEvent);
      
          if (published) {
            const { id, kind, pubkey, content, title, summary, image, published_at, d, topics } = parseEvent(resourceEvent);

            const user = window.localStorage.getItem('user');
            const userId = JSON.parse(user).id;
      
            const payload = {
              
            };
      
            if (payload && payload.user) {
              try {
                const response = await axios.post('/api/resources', payload);
                
                if (response.status === 201) {
                  try {
                    const deleteResponse = await axios.delete(`/api/drafts/${resourceEvent.id}`);
                    
                    if (deleteResponse.status === 204) {
                      return true;
                    }
                  } catch (error) {
                    console.error('Error deleting draft:', error);
                    return false;
                  }
                }
              } catch (error) {
                console.error('Error creating resource:', error);
                return false;
              }
            }
          }
      
          return false;
        },
        [publish]
      );


      const publishCourse = useCallback(
        async (courseEvent) => {
          const published = await publish(courseEvent);
      
          if (published) {
            const user = window.localStorage.getItem('user');
            const pubkey = JSON.parse(user).pubkey;
      
            const payload = {
              title: courseEvent.title,
              summary: courseEvent.summary,
              type: 'course',
              content: courseEvent.content,
              image: courseEvent.image,
              user: pubkey,
              topics: [...courseEvent.topics.map(topic => topic.trim().toLowerCase()), 'plebdevs', 'course']
            };
      
            if (payload && payload.user) {
              try {
                const response = await axios.post('/api/courses', payload);
                
                if (response.status === 201) {
                  try {
                    const deleteResponse = await axios.delete(`/api/drafts/${courseEvent.id}`);
                    
                    if (deleteResponse.status === 204) {
                      return true;
                    }
                  } catch (error) {
                    console.error('Error deleting draft:', error);
                    return false;
                  }
                }
              } catch (error) {
                console.error('Error creating course:', error);
                return false;
              }
            }
          }
      
          return false;
        },
        [publish]
      );

    return { subscribe, publish, fetchSingleEvent, fetchZapsForEvent, fetchKind0, fetchResources, fetchWorkshops, fetchCourses, zapEvent, fetchZapsForEvents, publishResource, publishCourse };
}