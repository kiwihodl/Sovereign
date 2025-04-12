import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/useToast';
import { Tag } from 'primereact/tag';
import Image from 'next/image';
import { useRouter } from 'next/router';
import CoursePaymentButton from '@/components/bitcoinConnect/CoursePaymentButton';
import ZapDisplay from '@/components/zaps/ZapDisplay';
import GenericButton from '@/components/buttons/GenericButton';
import { nip19 } from 'nostr-tools';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useZapsSubscription } from '@/hooks/nostrQueries/zaps/useZapsSubscription';
import { getTotalFromZaps } from '@/utils/lightning';
import { useSession } from 'next-auth/react';
import useWindowWidth from '@/hooks/useWindowWidth';
import { useNDKContext } from '@/context/NDKContext';
import { findKind0Fields } from '@/utils/nostr';
import appConfig from '@/config/appConfig';
import useTrackCourse from '@/hooks/tracking/useTrackCourse';
import WelcomeModal from '@/components/onboarding/WelcomeModal';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import MoreOptionsMenu from '@/components/ui/MoreOptionsMenu';
import { Divider } from 'primereact/divider';

export default function CourseDetails({
  processedEvent,
  paidCourse,
  lessons,
  decryptionPerformed,
  handlePaymentSuccess,
  handlePaymentError,
}) {
  const [zapAmount, setZapAmount] = useState(0);
  const [author, setAuthor] = useState(null);
  const [nAddress, setNAddress] = useState(null);
  const router = useRouter();
  const { returnImageProxy } = useImageProxy();
  const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: processedEvent });
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const windowWidth = useWindowWidth();
  const isMobileView = windowWidth <= 768;
  const { ndk } = useNDKContext();
  const menuRef = useRef(null);
  const toastRef = useRef(null);

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/courses/${processedEvent.d}`);
      if (response.status === 204) {
        showToast('success', 'Success', 'Course deleted successfully.');
        router.push('/');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to delete course. Please try again.');
    }
  };

  const menuItems = [
    {
      label: processedEvent?.pubkey === session?.user?.pubkey ? 'Edit' : null,
      icon: 'pi pi-pencil',
      command: () => router.push(`/course/${processedEvent.d}/edit`),
      visible: processedEvent?.pubkey === session?.user?.pubkey,
    },
    {
      label: processedEvent?.pubkey === session?.user?.pubkey ? 'Delete' : null,
      icon: 'pi pi-trash',
      command: handleDelete,
      visible: processedEvent?.pubkey === session?.user?.pubkey,
    },
    {
      label: 'View Nostr note',
      icon: 'pi pi-globe',
      command: () => window.open(`https://nostr.band/${nAddress}`, '_blank'),
    },
  ];

  const { isCompleted } = useTrackCourse({
    courseId: processedEvent?.d,
    paidCourse,
    decryptionPerformed,
  });

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
    if (processedEvent) {
      const naddr = nip19.naddrEncode({
        pubkey: processedEvent.pubkey,
        kind: processedEvent.kind,
        identifier: processedEvent.d,
        relays: appConfig.defaultRelayUrls,
      });
      setNAddress(naddr);
    }
  }, [processedEvent]);

  useEffect(() => {
    if (processedEvent) {
      fetchAuthor(processedEvent.pubkey);
    }
  }, [fetchAuthor, processedEvent]);

  useEffect(() => {
    if (zaps.length > 0) {
      const total = getTotalFromZaps(zaps, processedEvent);
      setZapAmount(total);
    }
  }, [zaps, processedEvent]);

  const renderPaymentMessage = () => {
    if (session?.user && session.user?.role?.subscribed && decryptionPerformed) {
      return (
        <GenericButton
          tooltipOptions={{ position: 'top' }}
          tooltip={`You are subscribed so you can access all paid content`}
          icon="pi pi-check"
          label="Subscribed"
          severity="success"
          outlined
          size="small"
          className="cursor-default hover:opacity-100 hover:bg-transparent focus:ring-0"
        />
      );
    }

    if (
      paidCourse &&
      decryptionPerformed &&
      author &&
      processedEvent?.pubkey !== session?.user?.pubkey &&
      !session?.user?.role?.subscribed
    ) {
      return (
        <GenericButton
          icon="pi pi-check"
          label={`Paid`}
          severity="success"
          outlined
          size="small"
          tooltip={`You paid ${processedEvent.price} sats to access this course (or potentially less if a discount was applied)`}
          tooltipOptions={{ position: 'top' }}
          className="cursor-default hover:opacity-100 hover:bg-transparent focus:ring-0"
        />
      );
    }

    if (paidCourse && author && processedEvent?.pubkey === session?.user?.pubkey) {
      return (
        <GenericButton
          tooltipOptions={{ position: 'top' }}
          tooltip={`You created this paid course, users must pay ${processedEvent.price} sats to access it`}
          icon="pi pi-check"
          label={`Price ${processedEvent.price} sats`}
          severity="success"
          outlined
          size="small"
          className="cursor-default hover:opacity-100 hover:bg-transparent focus:ring-0"
        />
      );
    }

    if (paidCourse && !decryptionPerformed) {
      return (
        <div className="w-fit">
          <CoursePaymentButton
            lnAddress={author?.lud16}
            amount={processedEvent.price}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            courseId={processedEvent.d}
          />
        </div>
      );
    }

    return null;
  };

  if (!processedEvent || !author) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Toast ref={toastRef} />
      <WelcomeModal />
      
      <div className="flex flex-col">
        {/* Header with course image, title and options */}
        <div className="flex mb-6">
          {/* Course image */}
          <div className="relative w-52 h-32 mr-6 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              alt="course image"
              src={returnImageProxy(processedEvent.image)}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Title and options */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                {isCompleted && (
                  <Tag severity="success" value="Completed" className="mb-2" />
                )}
                <h1 className="text-2xl font-bold text-white">{processedEvent.name}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <ZapDisplay
                  zapAmount={zapAmount}
                  event={processedEvent}
                  zapsLoading={zapsLoading && zapAmount === 0}
                />
                <MoreOptionsMenu
                  menuItems={menuItems}
                  additionalLinks={processedEvent?.additionalLinks || []}
                  isMobileView={isMobileView}
                />
              </div>
            </div>
            
            {/* Topics/tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {processedEvent.topics &&
                processedEvent.topics.length > 0 &&
                processedEvent.topics.map((topic, index) => (
                  <Tag className="text-white" key={index} value={topic}></Tag>
                ))}
            </div>
            
            {/* Author info */}
            <div className="flex items-center">
              <Image
                alt="avatar image"
                src={returnImageProxy(author?.avatar, author?.pubkey)}
                width={32}
                height={32}
                className="rounded-full mr-2"
              />
              <p className="text-gray-300">
                Created by{' '}
                <a
                  rel="noreferrer noopener"
                  target="_blank"
                  className="text-blue-300 hover:underline"
                >
                  {author?.username || author?.name || author?.pubkey}
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <Divider className="my-4" />
        
        {/* Course details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Description */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-3 text-white">About This Course</h2>
            <div className="text-gray-300 mb-4">
              {processedEvent.description &&
                processedEvent.description
                  .split('\n')
                  .map((line, index) => <p key={index} className="mb-2">{line}</p>)}
            </div>
            
            {/* Payment section */}
            <div className="mt-4">
              {renderPaymentMessage()}
            </div>
          </div>
          
          {/* Right column: Course details */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-white">Course Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-300 font-medium mb-2">Course Content</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Lessons</p>
                    <p className="font-semibold text-white">{lessons.length}</p>
                  </div>
                  {paidCourse && (
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="font-semibold text-white">{processedEvent.price} sats</p>
                    </div>
                  )}
                </div>
              </div>
              
              {processedEvent.published && (
                <div>
                  <h3 className="text-gray-300 font-medium mb-2">Details</h3>
                  <div>
                    <p className="text-sm text-gray-400">Published</p>
                    <p className="font-semibold text-white">
                      {new Date(processedEvent.published * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
