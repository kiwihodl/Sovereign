import React from 'react';

const NostrSection = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Why Nostr Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-6">Why Nostr?</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Explore how Nostr is revolutionizing social media and communication with
          censorship-resistant protocols.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6 hover:border-purple-400 transition-colors">
          <div className="text-purple-400 text-3xl mb-4">🔗</div>
          <h3 className="text-xl font-bold text-white mb-3">Decentralized Social</h3>
          <p className="text-gray-300">
            No central authority controls your data or can censor your content. You own your
            identity.
          </p>
        </div>

        <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6 hover:border-purple-400 transition-colors">
          <div className="text-purple-400 text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-white mb-3">Lightning Integration</h3>
          <p className="text-gray-300">
            Native Bitcoin Lightning payments for zaps, subscriptions, and monetization without
            intermediaries.
          </p>
        </div>

        <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6 hover:border-purple-400 transition-colors">
          <div className="text-purple-400 text-3xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-white mb-3">Censorship Resistant</h3>
          <p className="text-gray-300">
            Your content persists even if one relay goes down. Multiple relays ensure availability.
          </p>
        </div>

        <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6 hover:border-purple-400 transition-colors">
          <div className="text-purple-400 text-3xl mb-4">🔐</div>
          <h3 className="text-xl font-bold text-white mb-3">Cryptographic Identity</h3>
          <p className="text-gray-300">
            Your identity is secured by cryptography, not controlled by any platform or company.
          </p>
        </div>

        <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6 hover:border-purple-400 transition-colors">
          <div className="text-purple-400 text-3xl mb-4">🌐</div>
          <h3 className="text-xl font-bold text-white mb-3">Open Protocol</h3>
          <p className="text-gray-300">
            Anyone can build clients and applications on top of the Nostr protocol without
            permission.
          </p>
        </div>

        <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6 hover:border-purple-400 transition-colors">
          <div className="text-purple-400 text-3xl mb-4">💎</div>
          <h3 className="text-xl font-bold text-white mb-3">Monetization</h3>
          <p className="text-gray-300">
            Direct monetization through Lightning payments, zaps, and subscriptions without platform
            fees.
          </p>
        </div>
      </div>

      {/* What is Nostr Section - Anchor for scrolling */}
      <div id="what-section" className="pt-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-6">What is Nostr?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nostr (Notes and Other Stuff Transmitted by Relays) is a simple, open protocol for
            decentralized social media.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Core Concepts</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Relays</h4>
                <p className="text-gray-300">
                  Servers that store and forward messages. Anyone can run a relay, and clients
                  connect to multiple relays.
                </p>
              </div>

              <div className="border-l-4 border-purple-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Cryptographic Keys</h4>
                <p className="text-gray-300">
                  Your identity is a cryptographic keypair. You sign messages with your private key,
                  verified with your public key.
                </p>
              </div>

              <div className="border-l-4 border-purple-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Events</h4>
                <p className="text-gray-300">
                  All content is structured as signed events that can contain text, images,
                  payments, and more.
                </p>
              </div>

              <div className="border-l-4 border-purple-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Clients</h4>
                <p className="text-gray-300">
                  Different applications can read and write to the same network, each with their own
                  interface and features.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-purple-400/30 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Decentralized and censorship-resistant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">No central authority or company</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Native Bitcoin Lightning integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Multiple client applications</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Open protocol for innovation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Your data, your control</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NostrSection;
