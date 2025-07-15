import React from 'react';

const BitcoinSection = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Why Bitcoin Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-6">Why Bitcoin?</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Discover the fundamental reasons why Bitcoin represents the future of money and financial
          sovereignty.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-black/50 border border-orange-400/30 rounded-lg p-6 hover:border-orange-400 transition-colors">
          <div className="text-orange-400 text-3xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-white mb-3">Sound Money</h3>
          <p className="text-gray-300">
            Bitcoin&apos;s fixed supply of 21 million creates true scarcity, making it the first
            sound money in history.
          </p>
        </div>

        <div className="bg-black/50 border border-orange-400/30 rounded-lg p-6 hover:border-orange-400 transition-colors">
          <div className="text-orange-400 text-3xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-white mb-3">Censorship Resistance</h3>
          <p className="text-gray-300">
            No government or institution can prevent you from sending or receiving Bitcoin
            transactions.
          </p>
        </div>

        <div className="bg-black/50 border border-orange-400/30 rounded-lg p-6 hover:border-orange-400 transition-colors">
          <div className="text-orange-400 text-3xl mb-4">🌍</div>
          <h3 className="text-xl font-bold text-white mb-3">Global Access</h3>
          <p className="text-gray-300">
            Anyone with internet access can participate in the Bitcoin network, regardless of
            location.
          </p>
        </div>

        <div className="bg-black/50 border border-orange-400/30 rounded-lg p-6 hover:border-orange-400 transition-colors">
          <div className="text-orange-400 text-3xl mb-4">🔐</div>
          <h3 className="text-xl font-bold text-white mb-3">Self-Sovereignty</h3>
          <p className="text-gray-300">
            You control your own money without relying on banks or third-party intermediaries.
          </p>
        </div>

        <div className="bg-black/50 border border-orange-400/30 rounded-lg p-6 hover:border-orange-400 transition-colors">
          <div className="text-orange-400 text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-white mb-3">Lightning Network</h3>
          <p className="text-gray-300">
            Instant, nearly-free transactions that scale Bitcoin for global adoption.
          </p>
        </div>

        <div className="bg-black/50 border border-orange-400/30 rounded-lg p-6 hover:border-orange-400 transition-colors">
          <div className="text-orange-400 text-3xl mb-4">🏗️</div>
          <h3 className="text-xl font-bold text-white mb-3">Open Protocol</h3>
          <p className="text-gray-300">
            Bitcoin is an open protocol that anyone can build on, driving innovation and adoption.
          </p>
        </div>
      </div>

      {/* What is Bitcoin Section - Anchor for scrolling */}
      <div id="what-section" className="pt-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-6">What is Bitcoin?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Bitcoin is a decentralized digital currency that operates on a peer-to-peer network
            without central authority.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Core Concepts</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-orange-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Blockchain Technology</h4>
                <p className="text-gray-300">
                  A distributed ledger that records all transactions in a secure, transparent, and
                  immutable way.
                </p>
              </div>

              <div className="border-l-4 border-orange-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Proof of Work</h4>
                <p className="text-gray-300">
                  A consensus mechanism that secures the network through computational work and
                  energy expenditure.
                </p>
              </div>

              <div className="border-l-4 border-orange-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Mining</h4>
                <p className="text-gray-300">
                  The process of validating transactions and creating new blocks in the blockchain.
                </p>
              </div>

              <div className="border-l-4 border-orange-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Lightning Network</h4>
                <p className="text-gray-300">
                  A second-layer solution that enables instant, low-cost Bitcoin transactions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-orange-400/30 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Fixed supply of 21 million coins</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Decentralized and permissionless</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Censorship resistant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Open source and transparent</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Global and borderless</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Self-sovereign money</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinSection;
