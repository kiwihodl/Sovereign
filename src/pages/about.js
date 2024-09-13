import React, { useState } from 'react';
import Image from 'next/image';
import NostrIcon from '../../public/images/nostr.png';
import { Tooltip } from 'primereact/tooltip';
import { useToast } from "@/hooks/useToast"

const AboutPage = () => {
    const {showToast} = useToast()

    const copyToClipboard = async (text) => {
        try {
          await navigator.clipboard.writeText(text);
          showToast("success", "Copied", "Copied Lightning Address to clipboard")
          if (window && window?.webln && window?.webln?.lnurl) {
            await window.webln.enable();
            const result = await window.webln.lnurl("austin@bitcoinpleb.dev");
            if (result && result?.preimage) {
              showToast("success", "Copied", "Copied Lightning Address to clipboard")
            }
          }
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">About PlebDevs</h1>
            
            <div className="bg-gray-700 rounded-lg p-6 mb-8">
                <p className="text-lg flex items-center">
                    <i className="pi pi-info-circle text-blue-500 mr-3 text-2xl"></i>
                    PlebDevs is a custom-built education platform designed to help new and aspiring developers, with a special focus on Bitcoin Lightning and Nostr technologies.
                </p>
                {/* <p className='text-lg font-semibold px-9 mt-4'> */}
                    <p className='font-normal text-lg px-9 mt-4 mb-2'>The pitch is simple:</p>
                    <ul className='list-disc list-inside ml-16 space-y-2'>
                        <li>Learn how to code 💻</li>
                        <li>Build Bitcoin / Lightning / Nostr apps ⚡</li>
                        <li>Become a developer 🚀</li>
                    </ul>
                {/* </p> */}
            </div>

            <div className="space-y-8">
                <h2 className="text-2xl font-bold flex items-center">
                    <i className="pi pi-star text-yellow-500 mr-3 text-2xl"></i>
                    Key Features
                </h2>

                {/* Feature sections */}
                <FeatureSection
                    icon="pi-cloud"
                    title="Content Distribution"
                    description="All educational content is published to Nostr and actively pulled from Nostr relays, ensuring decentralized and up-to-date information."
                />

                <FeatureSection
                    icon="pi-file-edit"
                    title="Content Types"
                    description={
                        <ul className="list-disc list-inside ml-6 space-y-2">
                            <li><span className="font-bold">Resources:</span> Markdown documents posted as NIP-23 long-form events on Nostr.</li>
                            <li><span className="font-bold">Workshops:</span> Enhanced markdown files with rich media support, including embedded videos, also saved as NIP-23 events.</li>
                            <li><span className="font-bold">Courses:</span> Nostr lists that combine multiple resources and workshops into a structured learning path.</li>
                        </ul>
                    }
                />
            </div>

            <div className="mt-12 bg-gray-700 rounded-lg p-6">
                <p className="italic text-lg flex items-center">
                    <i className="pi pi-flag text-blue-500 mr-3 text-2xl"></i>
                    PlebDevs aims to provide a comprehensive, decentralized learning experience for aspiring developers, with a strong emphasis on emerging technologies in the Bitcoin ecosystem.
                </p>
            </div>

            <div className="mt-12 bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-center space-x-16">
                    <Tooltip target=".pi-github" content="GitHub" position="bottom" />
                    <a href="https://github.com/pleb-devs" target="_blank" rel="noopener noreferrer">
                        <i className="pi pi-github text-white text-5xl"></i>
                    </a>
                    <Tooltip target=".pi-twitter" content="X.com" position="bottom" />
                    <a href="https://x.com/pleb_devs" target="_blank" rel="noopener noreferrer">
                        <i className="pi pi-twitter text-black text-5xl"></i>
                    </a>
                    <Tooltip target=".nostr-icon" content="Nostr" position="bottom" />
                    <a href="https://nostr.com/plebdevs@plebdevs.com" target="_blank" rel="noopener noreferrer">
                        <Image src={NostrIcon} alt="Nostr" width={44} height={44} className='nostr-icon' />
                    </a>
                    <Tooltip target=".pi-bolt" content="Donate" position="bottom" />
                    <p onClick={() => copyToClipboard("austin@bitcoinpleb.dev")} className='cursor-pointer'>
                        <i className="pi pi-bolt text-yellow-500 text-5xl"></i>
                    </p>
                </div>
            </div>
        </div>
    );
};

const FeatureSection = ({ icon, title, description }) => (
    <div className="bg-gray-700 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
            <i className={`pi ${icon} text-blue-500 mr-3 text-2xl`}></i>
            {title}
        </h3>
        {typeof description === 'string' ? (
            <p>{description}</p>
        ) : (
            description
        )}
    </div>
);

export default AboutPage;