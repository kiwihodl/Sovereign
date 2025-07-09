import React, { useState, useCallback, useEffect } from 'react';
import DocumentDetails from '@/components/content/documents/DocumentDetails';
import VideoDetails from '@/components/content/videos/VideoDetails';
import { parseEvent, findKind0Fields } from '@/utils/nostr';
import { nip19 } from 'nostr-tools';
import { useSession } from 'next-auth/react';
import { useNDKContext } from '@/context/NDKContext';
import { useDecryptContent } from '@/hooks/encryption/useDecryptContent';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/router';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import CombinedDetails from '@/components/content/combined/CombinedDetails';

// todo: /decrypt is still being called way too much on this page, need to clean up state management

const Details = () => {
  const [event, setEvent] = useState(null);
  const [author, setAuthor] = useState(null);
  const [nAddress, setNAddress] = useState(null);
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [authorView, setAuthorView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [npub, setNpub] = useState(null);
  const [nsec, setNsec] = useState(null);
  const { data: session, update } = useSession();
  const { ndk } = useNDKContext();
  const { decryptContent } = useDecryptContent();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    axios
      .get('/api/lessons')
      .then(res => {
        if (res.data) {
          res.data.forEach(lesson => {
            setLessons(prev => [
              ...prev,
              { resourceId: lesson?.resourceId, courseId: lesson?.courseId || null },
            ]);
          });
        }
      })
      .catch(err => {
        console.error('err', err);
      });
  }, []);

  const fetchAuthor = useCallback(
    async pubkey => {
      if (!pubkey) return;
      const author = await ndk.getUser({ pubkey });
      const profile = await author.fetchProfile();
      const fields = await findKind0Fields(profile);
      if (fields) {
        setAuthor(fields);
      }
    },
    [ndk]
  );

  useEffect(() => {
    if (event?.d && !nAddress) {
      const naddr = nip19.naddrEncode({
        pubkey: event.pubkey,
        kind: event.kind,
        identifier: event.d,
      });
      setNAddress(naddr);
    }
  }, [event, nAddress]);

  useEffect(() => {
    if (!author && event?.pubkey) {
      fetchAuthor(event?.pubkey);
    }
  }, [author, event, fetchAuthor]);

  useEffect(() => {
    if (session?.user?.privkey) {
      const privkeyBuffer = Buffer.from(session.user.privkey, 'hex');
      setNsec(nip19.nsecEncode(privkeyBuffer));
      setNpub(null);
    } else if (session?.user?.pubkey) {
      setNsec(null);
      setNpub(nip19.npubEncode(session.user.pubkey));
    } else {
      setNsec(null);
      setNpub(null);
    }
  }, [session]);

  useEffect(() => {
    const fetchAndProcessEvent = async () => {
      if (!router.isReady || !router.query.slug) return;

      const { slug } = router.query;
      let id;

      if (slug.includes('naddr')) {
        const { data } = nip19.decode(slug);
        if (!data) {
          showToast('error', 'Error', 'Resource not found');
          setLoading(false);
          return;
        }
        id = null;
        setNAddress(slug);
      } else {
        id = slug;
      }

      try {
        await ndk.connect();
        let filter;
        if (id) {
          filter = { ids: [id] };
        } else {
          const decoded = nip19.decode(slug);
          filter = { '#d': [decoded?.data?.identifier] };
        }
        const event = await ndk.fetchEvent(filter);

        if (event) {
          const parsedEvent = parseEvent(event);
          setEvent(parsedEvent);
          await fetchAuthor(event.pubkey);

          const isAuthor = session?.user?.pubkey === event.pubkey;
          setAuthorView(isAuthor);

          if (parsedEvent.price || (isAuthor && event.kind === 30402)) {
            const shouldDecrypt =
              isAuthor ||
              session?.user?.role?.subscribed ||
              session?.user?.purchased?.some(purchase => purchase.resourceId === parsedEvent.d) ||
              lessons.some(
                lesson =>
                  lesson.resourceId === parsedEvent.d &&
                  session?.user?.purchased?.some(purchase => purchase.courseId === lesson.courseId)
              );

            if (shouldDecrypt && !decryptedContent) {
              const decrypted = await decryptContent(event.content);
              setDecryptedContent(decrypted);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        showToast('error', 'Error', 'Failed to fetch event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessEvent();
  }, [router.isReady, router.query, ndk, session]);

  const handlePaymentSuccess = response => {
    if (response && response?.preimage) {
      update();
    } else {
      showToast('error', 'Error', 'Failed to purchase resource. Please try again.');
    }
  };

  const handlePaymentError = error => {
    showToast(
      'error',
      'Payment Error',
      `Failed to purchase resource. Please try again. Error: ${error}`
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center mt-24">
        <ProgressSpinner />
      </div>
    );
  }

  if (!author || !event) return null;

  const getDetailComponent = () => {
    if (event.topics.includes('video') && event.topics.includes('document')) {
      return CombinedDetails;
    }
    return event.type === 'document' ? DocumentDetails : VideoDetails;
  };

  const DetailComponent = getDetailComponent();

  const isAuthorized =
    !event.price || decryptedContent || session?.user?.role?.subscribed || authorView;

  return (
    <>
      <DetailComponent
        processedEvent={event}
        topics={event.topics}
        title={event.title}
        summary={event.summary}
        image={event.image}
        price={event.price}
        author={author}
        paidResource={!!event.price}
        isLesson={lessons.some(lesson => lesson.resourceId === event.d)}
        nAddress={nAddress}
        decryptedContent={decryptedContent}
        handlePaymentSuccess={handlePaymentSuccess}
        handlePaymentError={handlePaymentError}
        authorView={authorView}
      />
      {nAddress !== null && isAuthorized ? (
        <div className="px-4">
          <ZapThreadsWrapper
            anchor={nAddress}
            user={nsec || npub || null}
            relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://relay.primal.net/, wss://nostrue.com/, wss://purplerelay.com/"
            disable="zaps"
            isAuthorized={isAuthorized}
          />
        </div>
      ) : (
        <div className="text-center p-4 mx-4 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">
            Comments are only available to content purchasers, subscribers, and the content creator.
          </p>
        </div>
      )}
    </>
  );
};

export default Details;
