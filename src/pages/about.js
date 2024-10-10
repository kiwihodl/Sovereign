import React from 'react';
import Image from 'next/image';
import NostrIcon from '../../public/images/nostr.png';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { useToast } from "@/hooks/useToast";
import useWindowWidth from "@/hooks/useWindowWidth";
import GenericButton from '@/components/buttons/GenericButton';
import InteractivePromotionalCarousel from '@/components/content/carousels/InteractivePromotionalCarousel';

const AboutPage = () => {
    const { showToast } = useToast();
    const windowWidth = useWindowWidth();

    const isTabView = windowWidth <= 1360;

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast("success", "Copied", "Copied Lightning Address to clipboard");
            if (window && window?.webln && window?.webln?.lnurl) {
                await window.webln.enable();
                const result = await window.webln.lnurl("austin@bitcoinpleb.dev");
                if (result && result?.preimage) {
                    showToast("success", "Payment Sent", "Thank you for your donation!");
                }
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={`${isTabView ? 'w-full' : 'w-[83vw]'} p-4 mx-auto`}>
            <InteractivePromotionalCarousel />
            <Card title="Key Features" className="mb-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-start justify-center">
                        <div className='flex items-start'>
                            <i className="pi pi-cloud text-2xl text-primary mr-2 text-blue-400"></i>
                            <div>
                                <h3 className='text-lg font-semibold'>Content Distribution:</h3>
                                <p className='text-lg'>All educational content is published to Nostr and actively pulled from Nostr relays, ensuring distributed and up-to-date information.</p>
                                <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                                    <li><span className="text-lg font-semibold">Nostr:</span> All content is published to Nostr and actively pulled from Nostr relays, ensuring distributed and up-to-date information.</li>
                                    <li><span className="text-lg font-semibold">Zaps:</span> Zaps are currently initated through Zapper - <a href="https://zapper.nostrapps.org" target="_blank" rel="noopener noreferrer" className="text-blue-400">https://zapper.nostrapps.org</a> <br /> <span className="pl-4">* Zaps are pulled from Nostr using our own NDK integration.</span></li>
                                    <li><span className="text-lg font-semibold">Comments:</span> For comments we are leveraging ZapThreads - <a href="https://zapthreads.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-400">https://zapthreads.com</a> <br /> <span className="pl-4">* Comments are enabled on all content but for Community they are only enabled on the nostr feed.</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <i className="pi pi-file-edit text-2xl text-primary mr-2 text-green-400 mt-1"></i>
                        <div>
                            <h3 className="text-lg font-semibold">Content Types:</h3>
                            <p className='text-lg'>high signal, Bitcoin, Lightning, Nostr educational content.</p>
                            <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                                <li><span className="text-lg font-semibold">Documents:</span> Markdown documents posted as NIP-23 long-form events on Nostr.</li>
                                <li><span className="text-lg font-semibold">Videos:</span> Enhanced markdown files with rich media support, including embedded videos, also saved as NIP-23 events.</li>
                                <li><span className="text-lg font-semibold">Courses:</span> Nostr lists (NIP-51) that combines multiple documents and videos into a structured learning path.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <i className="pi pi-bolt text-2xl text-primary mr-2 mt-1 text-yellow-400"></i>
                        <div>
                            <h3 className="text-lg font-semibold">Content Monetization:</h3>
                            <p className='text-lg'>All content is zappable and some content is PAID requiring a Lightning purchase or Subscription through the platform for permanent access.</p>
                            <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                                <li><span className="text-lg font-semibold">Free:</span> Free content is available to all users. <br /> <span className="pl-4">* can be viewed on PlebDevs or any nostr client that supports NIP-23 and NIP-51.</span></li>
                                <li><span className="text-lg font-semibold">Paid:</span> Paid content is available for purchase with Lightning. <br /> <span className="pl-4">* published to nostr but encrypted with plebdevs private key, currently only viewable on PlebDevs platform.</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className='flex items-start'>
                        <i className="pi pi-star text-2xl text-primary mr-2 text-orange-400 mt-1"></i>
                        <div>
                            <h3 className="text-lg font-semibold">Subscriptions:</h3>
                            <p className='text-lg'>The PlebDevs subscription unlocks all paid content, gives access to our 1:1 calendar for tutoring/help, and grants you a plebdevs.com Lightning Address and Nostr NIP-05 identity.</p>
                            <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                                <li><span className="text-lg font-semibold">Pay-as-you-go:</span> 21,000 sats - A one-time payment that gives you access to all of the premium features for one month <br /> <span className="pl-4">* you will need to manually renew your subscription every month.</span></li>
                                <li><span className="text-lg font-semibold">Recurring:</span> 21,000 sats - A subscription option allows you to submit a Nostr Wallet Connect URI that will be used to automatically send the subscription fee every month <br /> <span className="pl-4">* you can cancel at any time.</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <i className="pi pi-users text-2xl text-primary mr-2 text-purple-400 mt-1"></i>
                        <div>
                            <h3 className="text-lg font-semibold">Community:</h3>
                            <p className='text-lg'>All of the current PlebDevs Community channels.</p>
                            <ul className="list-disc list-inside ml-2 mt-2 space-y-2">
                                <li><span className="text-lg font-semibold">Nostr:</span> Public plebdevs nostr chat (Read / Write) <br /> <span className="pl-4">* this is the only feed that you can write to from the plebdevs platform currently.</span></li>
                                <li><span className="text-lg font-semibold">Discord:</span> PlebDevs Discord server (Read Only) <br /> <span className="pl-4">* discord was the original home of the PlebDevs community, look at us now!</span></li>
                                <li><span className="text-lg font-semibold">StackerNews:</span> StackerNews ~devs territory (Read Only) <br /> <span className="pl-4">* a territory is like a &apos;subreddit&apos; on stackernews, plebdevs owns the ~devs territory.</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Connect with Us" className="mb-4">
                <div className="flex flex-wrap gap-4 justify-center">
                    <GenericButton
                        severity="secondary"
                        outlined
                        icon="pi pi-github"
                        tooltip="Github"
                        className="text-gray-300"
                        onClick={() => window.open('https://github.com/pleb-devs', '_blank')}
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
                        onClick={() => copyToClipboard("austin@bitcoinpleb.dev")}
                    />
                </div>
            </Card>
        </div>
    );
};

export default AboutPage;