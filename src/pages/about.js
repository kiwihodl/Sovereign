import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import NostrIcon from '../../public/images/nostr.png';
import { Card } from 'primereact/card';
import { useToast } from '@/hooks/useToast';
import useWindowWidth from '@/hooks/useWindowWidth';
import GenericButton from '@/components/buttons/GenericButton';
import InteractivePromotionalCarousel from '@/components/content/carousels/InteractivePromotionalCarousel';
import axios from 'axios';
import { Menu } from 'primereact/menu';
import { ProgressSpinner } from 'primereact/progressspinner';
import SubscriptionPaymentButtons from '@/components/bitcoinConnect/SubscriptionPaymentButton';
import CalendlyEmbed from '@/components/profile/subscription/CalendlyEmbed';
import CancelSubscription from '@/components/profile/subscription/CancelSubscription';
import RenewSubscription from '@/components/profile/subscription/RenewSubscription';
import Nip05Form from '@/components/profile/subscription/Nip05Form';
import LightningAddressForm from '@/components/profile/subscription/LightningAddressForm';
import MoreInfo from '@/components/MoreInfo';
import { SUBSCRIPTION_PERIODS } from '@/constants/subscriptionPeriods';

const AboutPage = () => {
  const { data: session, update } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const windowWidth = useWindowWidth();
  const menu = useRef(null);

  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribedUntil, setSubscribedUntil] = useState(null);
  const [subscriptionExpiredAt, setSubscriptionExpiredAt] = useState(null);
  const [calendlyVisible, setCalendlyVisible] = useState(false);
  const [lightningAddressVisible, setLightningAddressVisible] = useState(false);
  const [nip05Visible, setNip05Visible] = useState(false);
  const [cancelSubscriptionVisible, setCancelSubscriptionVisible] = useState(false);
  const [renewSubscriptionVisible, setRenewSubscriptionVisible] = useState(false);

  const isTabView = windowWidth <= 1160;
  const isMobile = windowWidth < 668;

  // FAQ content for the modal
  const faqContent = (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold">How does the subscription work?</h3>
        <p>
          Think of the subscriptions as a Patreon-type model. You pay a monthly fee and in return
          you get access to premium features and all of the paid content. You can cancel at any
          time.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">What are the benefits of a subscription?</h3>
        <p>
          The subscription gives you access to all of the premium features and all of the paid
          content. You can cancel at any time.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">How much does the subscription cost?</h3>
        <p>The subscription is 50,000 sats per month.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">How do I Subscribe? (Pay as you go)</h3>
        <p>
          The pay as you go subscription is a one-time payment that gives you access to all of the
          premium features for one month. You will need to manually renew your subscription every
          month.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">How do I Subscribe? (Recurring)</h3>
        <p>
          The recurring subscription option allows you to submit a Nostr Wallet Connect URI that
          will be used to automatically send the subscription fee every month. You can cancel at any
          time.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Can I cancel my subscription?</h3>
        <p>
          Yes, you can cancel your subscription at any time. Your access will remain active until
          the end of the current billing period.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">
          What happens if I don&apos;t renew my subscription?
        </h3>
        <p>
          If you don&apos;t renew your subscription, your access to 1:1 calendar and paid content
          will be removed. However, you will still have access to your PlebDevs Lightning Address,
          NIP-05, and any content that you paid for.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">What is Nostr Wallet Connect?</h3>
        <p>
          Nostr Wallet Connect is a Nostr-based authentication method that allows you to connect
          your Nostr wallet to the PlebDevs platform. This will allow you to subscribe to the
          platform in an auto recurring manner which still gives you full control over your wallet
          and the ability to cancel at any time from your wallet.
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    if (session && session?.user) {
      setUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    if (user && user.role) {
      setSubscribed(user.role.subscribed);
      const subscribedAt = new Date(user.role.lastPaymentAt);
      const subscribedUntil = new Date(subscribedAt.getTime() + SUBSCRIPTION_PERIODS.MONTHLY.DAYS * 24 * 60 * 60 * 1000);
      setSubscribedUntil(subscribedUntil);
      if (user.role.subscriptionExpiredAt) {
        const expiredAt = new Date(user.role.subscriptionExpiredAt);
        setSubscriptionExpiredAt(expiredAt);
      }
    }
  }, [user]);

  const handleSubscriptionSuccess = async response => {
    setIsProcessing(true);
    try {
      const apiResponse = await axios.put('/api/users/subscription', {
        userId: session.user.id,
        isSubscribed: true,
      });
      if (apiResponse.data) {
        await update();
        showToast('success', 'Subscription Successful', 'Your subscription has been activated.');
      } else {
        throw new Error('Failed to update subscription status');
      }
    } catch (error) {
      console.error('Subscription update error:', error);
      showToast('error', 'Subscription Update Failed', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscriptionError = error => {
    console.error('Subscription error:', error);
    showToast('error', 'Subscription Failed', `An error occurred: ${error.message}`);
    setIsProcessing(false);
  };

  const handleRecurringSubscriptionSuccess = async () => {
    setIsProcessing(true);
    try {
      await update();
      showToast(
        'success',
        'Recurring Subscription Activated',
        'Your recurring subscription has been set up successfully.'
      );
    } catch (error) {
      console.error('Session update error:', error);
      showToast('error', 'Session Update Failed', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const menuItems = [
    {
      label: 'Schedule 1:1',
      icon: 'pi pi-calendar',
      command: () => setCalendlyVisible(true),
    },
    {
      label: session?.user?.platformLightningAddress
        ? 'Update PlebDevs Lightning Address'
        : 'Claim PlebDevs Lightning Address',
      icon: 'pi pi-bolt',
      command: () => setLightningAddressVisible(true),
    },
    {
      label: session?.user?.platformNip05?.name
        ? 'Update PlebDevs Nostr NIP-05'
        : 'Claim PlebDevs Nostr NIP-05',
      icon: 'pi pi-at',
      command: () => setNip05Visible(true),
    },
    {
      label: 'Renew Subscription',
      icon: 'pi pi-sync',
      command: () => setRenewSubscriptionVisible(true),
    },
    {
      label: 'Cancel Subscription',
      icon: 'pi pi-trash',
      command: () => setCancelSubscriptionVisible(true),
    },
  ];

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied', 'Copied Lightning Address to clipboard');
      if (window && window?.webln && window?.webln?.lnurl) {
        await window.webln.enable();
        const result = await window.webln.lnurl('austin@bitcoinpleb.dev');
        if (result && result?.preimage) {
          showToast('success', 'Payment Sent', 'Thank you for your donation!');
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`${isTabView ? 'w-full' : 'w-full px-12'} ${isMobile ? 'p-0' : 'p-4'} mx-auto`}>
      <InteractivePromotionalCarousel />

      {/* For non-logged in users */}
      {!session?.user && (
        <>
          <Card title="Start Your PlebDevs Journey" className="mb-2">
            <p className="mb-4 text-xl">
              The PlebDevs subscription unlocks all paid content, grants access to our 1:1 calendar
              for tutoring, support, and mentorship, and grants you your own personal plebdevs.com
              Lightning Address and Nostr NIP-05 identity.
            </p>
            <p className="text-xl mb-4">
              Subscribe monthly with a pay-as-you-go option or set up an auto-recurring subscription
              using Nostr Wallet Connect.
            </p>
          </Card>
          <Card title="Ready to level up?" className="mb-2">
            <p className="text-xl pb-4">Login to start your subscription!</p>
            <GenericButton
              label="Login"
              onClick={() => router.push('/auth/signin')}
              className="text-[#f8f8ff] w-fit"
              rounded
              icon="pi pi-user"
            />
          </Card>
        </>
      )}

      {/* Subscription Card */}
      <Card
        className={`mb-2 relative ${isMobile ? 'm-2' : null}`}
        header={
          <div className="flex justify-between items-center p-4 pb-0">
            <h2 className="text-xl font-bold m-0">Subscribe to PlebDevs</h2>
            <MoreInfo
              tooltip="Subscription FAQ"
              tooltipPosition="top"
              modalTitle="Frequently Asked Questions"
              modalBody={faqContent}
              className="text-gray-400 hover:text-white"
            />
          </div>
        }
      >
        {!isProcessing ? (
          <div className="flex flex-col">
            {/* Only show premium benefits when not subscribed or session doesn't exist */}
            {(!session?.user || (session?.user && !subscribed)) && (
              <>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-primary">Unlock Premium Benefits</h3>
                  <p className="text-gray-400">
                    Subscribe now and elevate your development journey!
                  </p>
                </div>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex items-center">
                    <i className="pi pi-book text-2xl text-primary mr-2 text-blue-400"></i>
                    <span>Access ALL current and future PlebDevs content</span>
                  </div>
                  <div className="flex items-center">
                    <i className="pi pi-calendar text-2xl text-primary mr-2 text-red-400"></i>
                    <span>
                      Personal mentorship & guidance and access to exclusive 1:1 booking calendar
                    </span>
                  </div>
                  <div className="flex items-center">
                    <i className="pi pi-bolt text-2xl text-primary mr-2 text-yellow-500"></i>
                    <span>Claim your own personal plebdevs.com Lightning Address</span>
                  </div>
                  <div className="flex items-center">
                    <Image src={NostrIcon} alt="Nostr" width={25} height={25} className="mr-2" />
                    <span>Claim your own personal plebdevs.com Nostr NIP-05 identity</span>
                  </div>
                </div>
              </>
            )}
            <div className="mb-2 rounded-lg">
              {/* Status Messages */}
              {session && session?.user ? (
                <>
                  {subscribed && !user?.role?.nwc && (
                    <div className="flex flex-col">
                      <div className="flex items-center bg-green-900/50 border border-green-700 rounded p-2 text-green-300 w-fit">
                        <i className="pi pi-check-circle mr-2"></i>
                        <span>Subscribed!</span>
                      </div>
                      <p className="mt-3 font-medium">Thank you for your support 🎉</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Pay-as-you-go subscription must be manually renewed on{' '}
                        {subscribedUntil?.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {subscribed && user?.role?.nwc && (
                    <div className="flex flex-col">
                      <div className="flex items-center bg-green-900/50 border border-green-700 rounded p-2 text-green-300 w-fit">
                        <i className="pi pi-check-circle mr-2"></i>
                        <span>Subscribed!</span>
                      </div>
                      <p className="mt-3 font-medium">Thank you for your support 🎉</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Recurring subscription will AUTO renew on{' '}
                        {subscribedUntil?.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {!subscribed && !subscriptionExpiredAt && (
                    <div className="flex flex-col">
                      <div className="flex items-center bg-blue-900/50 border border-blue-700 rounded p-2 text-blue-300 w-fit">
                        <i className="pi pi-info-circle mr-2"></i>
                        <span>You currently have no active subscription</span>
                      </div>
                      <p className="mt-3 text-gray-400">
                        Subscribe below to unlock all premium features and content.
                      </p>
                    </div>
                  )}
                  {subscriptionExpiredAt && (
                    <div className="flex flex-col">
                      <div className="flex items-center bg-yellow-900/50 border border-yellow-700 rounded p-2 text-yellow-300 w-fit">
                        <i className="pi pi-exclamation-triangle mr-2"></i>
                        <span>
                          Your subscription expired on {subscriptionExpiredAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-400">
                        Renew below to continue enjoying all premium benefits.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center bg-blue-900/50 border border-blue-700 rounded p-2 text-blue-300 w-fit">
                    <i className="pi pi-info-circle mr-2"></i>
                    <span>Login to manage your subscription</span>
                  </div>
                  <p className="mt-3 text-gray-400">
                    Sign in to access subscription features and management.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Buttons */}
            {(!session?.user || (session?.user && !subscribed)) && (
              <SubscriptionPaymentButtons
                onSuccess={handleSubscriptionSuccess}
                onRecurringSubscriptionSuccess={handleRecurringSubscriptionSuccess}
                onError={handleSubscriptionError}
                setIsProcessing={setIsProcessing}
                layout={windowWidth < 768 ? 'col' : 'row'}
              />
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col mx-auto justify-center items-center mt-4">
            <div className="w-full h-full flex items-center justify-center">
              <ProgressSpinner />
            </div>
            <span className="ml-2">Processing subscription...</span>
          </div>
        )}
      </Card>

      {/* Subscription Management */}
      {session?.user && subscribed && (
        <>
          <Card title="Subscription Benefits" className="mb-2">
            <div className="flex flex-col gap-4">
              <GenericButton
                severity="info"
                outlined
                className="w-fit text-start"
                label="Schedule 1:1"
                icon="pi pi-calendar"
                onClick={() => setCalendlyVisible(true)}
              />
              <GenericButton
                severity="help"
                outlined
                className="w-fit text-start"
                label={
                  session?.user?.platformNip05?.name
                    ? 'Update Nostr NIP-05'
                    : 'Claim PlebDevs Nostr NIP-05'
                }
                icon="pi pi-at"
                onClick={() => setNip05Visible(true)}
              />
              <GenericButton
                severity="warning"
                outlined
                className="w-fit text-start"
                label={
                  session?.user?.platformLightningAddress
                    ? 'Update Lightning Address'
                    : 'Claim PlebDevs Lightning Address'
                }
                icon={<i style={{ color: 'orange' }} className="pi pi-bolt mr-2"></i>}
                onClick={() => setLightningAddressVisible(true)}
              />
            </div>
          </Card>
          <Card title="Manage Subscription" className="mb-2">
            <div className="flex flex-col gap-4">
              <GenericButton
                outlined
                className="w-fit"
                label="Renew Subscription"
                icon="pi pi-sync"
                onClick={() => setRenewSubscriptionVisible(true)}
              />
              <GenericButton
                severity="danger"
                outlined
                className="w-fit"
                label="Cancel Subscription"
                icon="pi pi-trash"
                onClick={() => setCancelSubscriptionVisible(true)}
              />
            </div>
          </Card>
        </>
      )}

      <Card title="Key Features" className={`mb-2 ${isMobile ? 'm-2' : null}`}>
        <div className="flex flex-col gap-4 max-w-[80%] max-mob:max-w-full">
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-start">
              <i className="pi pi-cloud text-2xl text-primary mr-2 text-blue-400"></i>
              <div>
                <h3 className="text-lg font-semibold">Content Distribution:</h3>
                <p className="text-lg">
                  All content is published to Nostr and actively pulled from Nostr relays
                </p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                  <li>
                    <span className="text-lg font-semibold">Nostr:</span> Content is stored on and
                    read from Nostr relays however a database is used for storing metadata and
                    filtering content.
                  </li>
                  <li>
                    <span className="text-lg font-semibold">Zaps:</span> Zaps are currently initated
                    through Zapper -{' '}
                    <a
                      href="https://zapper.nostrapps.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400"
                    >
                      https://zapper.nostrapps.org
                    </a>
                  </li>
                  <li>
                    <span className="text-lg font-semibold">Comments:</span> For comments we are
                    leveraging ZapThreads -{' '}
                    <a
                      href="https://zapthreads.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400"
                    >
                      https://zapthreads.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex items-start">
            <i className="pi pi-file-edit text-2xl text-primary mr-2 text-green-400 mt-1"></i>
            <div>
              <h3 className="text-lg font-semibold">Content Types:</h3>
              <p className="text-lg">
                High signal, Bitcoin, Lightning, and Nostr educational content.
              </p>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">Documents:</span> Markdown documents
                  posted as NIP-23 long-form events on Nostr.
                </li>
                <li>
                  <span className="text-lg font-semibold">Videos:</span> Formatted markdown
                  documents with rich media support, including embedded videos, also saved as NIP-23
                  events.
                </li>
                <li>
                  <span className="text-lg font-semibold">Courses:</span> Nostr lists (NIP-51) that
                  combines multiple documents and videos into a structured learning path.
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-start">
            <i className="pi pi-bolt text-2xl text-primary mr-2 mt-1 text-yellow-400"></i>
            <div>
              <h3 className="text-lg font-semibold">Content Monetization:</h3>
              <p className="text-lg">
                All content is zappable and some content is PAID requiring a Lightning purchase or
                Subscription through the platform for permanent access.
              </p>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">Free:</span> Free content is available to
                  all users. <br />{' '}
                  <span className="pl-4">
                    * can be viewed on PlebDevs or any nostr client that supports NIP-23 and NIP-51.
                  </span>
                </li>
                <li>
                  <span className="text-lg font-semibold">Paid:</span> Paid content is available for
                  purchase with Lightning. <br />{' '}
                  <span className="pl-4">
                    * published to nostr but encrypted with plebdevs private key, currently only
                    viewable on PlebDevs platform.
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-start">
            <i className="pi pi-star text-2xl text-primary mr-2 text-orange-400 mt-1"></i>
            <div>
              <h3 className="text-lg font-semibold">Subscriptions:</h3>
              <p className="text-lg">
                The PlebDevs subscription unlocks all paid content, gives access to our 1:1 calendar
                for tutoring/help, and grants you a plebdevs.com Lightning Address and Nostr NIP-05
                identity.
              </p>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">Pay-as-you-go:</span> 50,000 sats - A
                  one-time payment that gives you access to all of the premium features for one
                  month <br />{' '}
                  <span className="pl-4">
                    * you will need to manually renew your subscription every month.
                  </span>
                </li>
                <li>
                  <span className="text-lg font-semibold">Recurring:</span> 50,000 sats - A
                  subscription option allows you to submit a Nostr Wallet Connect URI that will be
                  used to automatically send the subscription fee every month <br />{' '}
                  <span className="pl-4">* you can cancel at any time.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-start">
            <i className="pi pi-users text-2xl text-primary mr-2 text-purple-400 mt-1"></i>
            <div>
              <h3 className="text-lg font-semibold">Feeds:</h3>
              <p className="text-lg">All of the current PlebDevs Community channels.</p>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">Nostr:</span> Public plebdevs nostr chat
                  (Read / Write) <br />{' '}
                  <span className="pl-4">
                    * this is the only feed that you can write to from the plebdevs platform
                    currently.
                  </span>
                </li>
                <li>
                  <span className="text-lg font-semibold">Discord:</span> PlebDevs Discord server
                  (Read Only) <br />{' '}
                  <span className="pl-4">
                    * discord was the original home of the PlebDevs community, look at us now!
                  </span>
                </li>
                <li>
                  <span className="text-lg font-semibold">StackerNews:</span> StackerNews ~devs
                  territory (Read Only) <br />{' '}
                  <span className="pl-4">
                    * a territory is like a &apos;subreddit&apos; on stackernews, plebdevs owns the
                    ~devs territory.
                  </span>
                </li>
              </ul>
            </div>
          </div>
          {/* techstack */}
          <div className="flex items-start">
            <i className="pi pi-cog text-2xl text-primary mr-2 text-gray-400 mt-1"></i>
            <div>
              <h3 className="text-lg font-semibold">Tech Stack:</h3>
              <h4 className="text-lg font-semibold">Frontend:</h4>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">Next.js:</span> A React framework for
                  building server-side rendered (SSR) web applications.
                </li>
                <li>
                  <span className="text-lg font-semibold">Tailwind CSS:</span> A utility-first CSS
                  framework for rapidly building custom designs.
                </li>
                <li>
                  <span className="text-lg font-semibold">PrimeReact:</span> A React UI library for
                  building modern, responsive web applications.
                </li>
              </ul>
              <h4 className="text-lg font-semibold">Backend:</h4>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">Prisma:</span> A database toolkit for
                  Node.js and TypeScript.
                </li>
                <li>
                  <span className="text-lg font-semibold">PostgreSQL:</span> A powerful, open source
                  object-relational database system.
                </li>
                <li>
                  <span className="text-lg font-semibold">Redis:</span> An in-memory data structure
                  store, used as a database, cache, and message broker.
                </li>
              </ul>
              <h4 className="text-lg font-semibold">Infrastructure:</h4>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">Vercel:</span> A cloud platform for
                  building modern web applications.
                </li>
                <li>
                  <span className="text-lg font-semibold">Docker:</span> A platform for building,
                  shipping, and running distributed applications.
                </li>
                <li>
                  <span className="text-lg font-semibold">Digital Ocean (CDN):</span> A cloud
                  platform for building modern web applications.
                </li>
              </ul>
              <h4 className="text-lg font-semibold">Open Source Tools:</h4>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                <li>
                  <span className="text-lg font-semibold">NDK:</span> Nostr Development Kit -{' '}
                  <a
                    href="https://github.com/nostr-dev-kit/ndk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    https://github.com/nostr-dev-kit/ndk
                  </a>
                </li>
                <li>
                  <span className="text-lg font-semibold">nostr-tools:</span> React framework for
                  building Nostr applications -{' '}
                  <a
                    href="https://github.com/fiatjaf/nostr-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    https://github.com/fiatjaf/nostr-tools
                  </a>
                </li>
                <li>
                  <span className="text-lg font-semibold">Bitcoin Connect:</span> A simple open
                  source tool for connecting to Lightning wallets and facilitating payments -{' '}
                  <a
                    href="https://github.com/getAlby/bitcoin-connect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    https://github.com/getAlby/bitcoin-connect
                  </a>
                </li>
                <li>
                  <span className="text-lg font-semibold">Alby JS SDK:</span> JavaScript SDK for the
                  Alby OAuth2 Wallet API and the Nostr Wallet Connect API. -{' '}
                  <a
                    href="https://github.com/getAlby/js-sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    https://github.com/getAlby/js-sdk
                  </a>
                </li>
                <li>
                  <span className="text-lg font-semibold">Zapthreads:</span> A Nostr-based
                  commenting system -{' '}
                  <a
                    href="https://github.com/franzaps/zapthreads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    https://github.com/franzaps/zapthreads
                  </a>
                </li>
                <li>
                  <span className="text-lg font-semibold">Zapper:</span> A Nostr-based tipping
                  platform -{' '}
                  <a
                    href="https://github.com/nostrband/zapper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    https://github.com/nostrband/zapper
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Connect with Us" className="max-tab:mx-2 mb-20 lg:mb-2">
        <div className="flex flex-wrap gap-4 justify-center">
          <GenericButton
            severity="secondary"
            outlined
            icon="pi pi-github"
            tooltip="Github"
            className="text-gray-300"
            onClick={() => window.open('https://github.com/austinkelsay/plebdevs', '_blank')}
          />
          <GenericButton
            severity="info"
            outlined
            icon="pi pi-twitter"
            tooltip="X"
            onClick={() => window.open('https://x.com/pleb_devs', '_blank')}
          />
          <GenericButton
            severity="help"
            outlined
            icon={<Image src={NostrIcon} alt="Nostr" width={20} height={20} className="mr-0" />}
            tooltip="Nostr"
            onClick={() => window.open('https://nostr.com/plebdevs@plebdevs.com', '_blank')}
          />
          <GenericButton
            severity="danger"
            outlined
            icon="pi pi-youtube"
            tooltip="Youtube"
            onClick={() => window.open('https://www.youtube.com/@plebdevs', '_blank')}
          />
          <GenericButton
            severity="warning"
            className="text-yellow-400"
            outlined
            icon="pi pi-bolt"
            tooltip="Donate"
            onClick={() => copyToClipboard('austin@bitcoinpleb.dev')}
          />
        </div>
      </Card>

      {/* Dialog Components */}
      <CalendlyEmbed
        visible={calendlyVisible}
        onHide={() => setCalendlyVisible(false)}
        userId={session?.user?.id}
        userName={session?.user?.username || user?.kind0?.username}
        userEmail={session?.user?.email}
      />
      <CancelSubscription
        visible={cancelSubscriptionVisible}
        onHide={() => setCancelSubscriptionVisible(false)}
      />
      <RenewSubscription
        visible={renewSubscriptionVisible}
        onHide={() => setRenewSubscriptionVisible(false)}
        subscribedUntil={subscribedUntil}
      />
      <Nip05Form visible={nip05Visible} onHide={() => setNip05Visible(false)} />
      <LightningAddressForm
        visible={lightningAddressVisible}
        onHide={() => setLightningAddressVisible(false)}
      />
    </div>
  );
};

export default AboutPage;
