import React from 'react';

const PrivacySection = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Why Privacy Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-teal-400 mb-6">Why Privacy?</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Understand why privacy is fundamental to human dignity and digital sovereignty in the
          modern world.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-black/50 border border-teal-400/30 rounded-lg p-6 hover:border-teal-400 transition-colors">
          <div className="text-teal-400 text-3xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-white mb-3">Digital Sovereignty</h3>
          <p className="text-gray-300">
            Control your own data and digital identity without corporate surveillance or government
            overreach.
          </p>
        </div>

        <div className="bg-black/50 border border-teal-400/30 rounded-lg p-6 hover:border-teal-400 transition-colors">
          <div className="text-teal-400 text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-white mb-3">Financial Privacy</h3>
          <p className="text-gray-300">
            Keep your financial transactions private and secure from prying eyes and data brokers.
          </p>
        </div>

        <div className="bg-black/50 border border-teal-400/30 rounded-lg p-6 hover:border-teal-400 transition-colors">
          <div className="text-teal-400 text-3xl mb-4">🎭</div>
          <h3 className="text-xl font-bold text-white mb-3">Freedom of Expression</h3>
          <p className="text-gray-300">
            Express yourself freely without fear of surveillance, censorship, or social scoring.
          </p>
        </div>

        <div className="bg-black/50 border border-teal-400/30 rounded-lg p-6 hover:border-teal-400 transition-colors">
          <div className="text-teal-400 text-3xl mb-4">🧠</div>
          <h3 className="text-xl font-bold text-white mb-3">Mental Freedom</h3>
          <p className="text-gray-300">
            Think, research, and explore without algorithmic manipulation or behavioral tracking.
          </p>
        </div>

        <div className="bg-black/50 border border-teal-400/30 rounded-lg p-6 hover:border-teal-400 transition-colors">
          <div className="text-teal-400 text-3xl mb-4">🌐</div>
          <h3 className="text-xl font-bold text-white mb-3">Alternative Networks</h3>
          <p className="text-gray-300">
            Build and use decentralized networks that prioritize privacy over profit and
            surveillance.
          </p>
        </div>

        <div className="bg-black/50 border border-teal-400/30 rounded-lg p-6 hover:border-teal-400 transition-colors">
          <div className="text-teal-400 text-3xl mb-4">⚖️</div>
          <h3 className="text-xl font-bold text-white mb-3">Human Rights</h3>
          <p className="text-gray-300">
            Privacy is a fundamental human right essential for democracy, dignity, and individual
            liberty.
          </p>
        </div>
      </div>

      {/* What is Privacy Section - Anchor for scrolling */}
      <div id="what-section" className="pt-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-teal-400 mb-6">What is Privacy?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Privacy is the right to control your personal information and digital footprint in an
            increasingly connected world.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Core Concepts</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-teal-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Data Sovereignty</h4>
                <p className="text-gray-300">
                  The right to own, control, and decide how your personal data is collected, used,
                  and shared.
                </p>
              </div>

              <div className="border-l-4 border-teal-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Zero-Knowledge Proofs</h4>
                <p className="text-gray-300">
                  Cryptographic methods that allow you to prove something without revealing the
                  underlying data.
                </p>
              </div>

              <div className="border-l-4 border-teal-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">End-to-End Encryption</h4>
                <p className="text-gray-300">
                  Communication methods where only the intended recipients can read the messages.
                </p>
              </div>

              <div className="border-l-4 border-teal-400 pl-6">
                <h4 className="text-lg font-semibold text-white mb-2">Decentralized Identity</h4>
                <p className="text-gray-300">
                  Self-sovereign identity systems that put you in control of your digital identity.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-teal-400/30 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Privacy Tools</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-gray-300">Tor Network for anonymous browsing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-gray-300">Signal for encrypted messaging</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-gray-300">ProtonMail for private email</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-gray-300">Monero for private transactions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-gray-300">VPNs for network privacy</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-gray-300">Decentralized social networks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySection;
