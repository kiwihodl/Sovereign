import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

const BitcoinQuiz = () => {
  const [answers, setAnswers] = useState({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
    question5: null,
    question6: null,
    question7: null,
    question8: null,
    question9: null,
    question10: null,
  });

  const question1Options = [
    { label: 'Yes, I own Bitcoin.', value: 'answer1a' },
    { label: 'No, I want to buy Bitcoin.', value: 'answer1b' },
    { label: "I'm exploring options and don't own Bitcoin yet.", value: 'answer1c' },
  ];

  const question2Options = [
    { label: 'Beginner (new to crypto, need simple solutions).', value: 'answer2a' },
    {
      label: 'Intermediate (familiar with wallets, transactions, and basic security).',
      value: 'answer2b',
    },
    {
      label: 'Advanced (comfortable with hardware wallets, nodes, or multi-sig setups).',
      value: 'answer2c',
    },
  ];

  const question3Options = [
    { label: 'Long-term storage (hodling).', value: 'answer3a' },
    { label: 'Frequent transactions (e.g., trading or payments).', value: 'answer3b' },
    { label: 'Privacy and anonymity.', value: 'answer3c' },
    { label: 'Inheritance or estate planning.', value: 'answer3d' },
  ];

  const question4Options = [
    { label: 'Less than $1,000.', value: 'answer4a' },
    { label: '$1,000–$10,000.', value: 'answer4b' },
    { label: '$10,000–$50,000.', value: 'answer4c' },
    { label: '$50,000–$100,000.', value: 'answer4d' },
    { label: 'Over $100,000.', value: 'answer4e' },
    { label: 'Prefer not to say.', value: 'answer4f' },
  ];

  const question5Options = [
    { label: 'Full control (I want to manage my own keys).', value: 'answer5a' },
    {
      label: 'Independence with assistance (e.g., setup help or collaborative custody).',
      value: 'answer5b',
    },
    { label: 'I prefer a guided setup with ongoing support.', value: 'answer5c' },
  ];

  const question6Options = [
    { label: 'Single-signature wallet with a passphrase (simpler, one key).', value: 'answer6a' },
    { label: 'Multi-signature wallet (more secure, multiple keys).', value: 'answer6b' },
    { label: "No preference, recommend what's best for me.", value: 'answer6c' },
  ];

  const question7Options = [
    { label: 'Very important (I want to avoid KYC if possible).', value: 'answer7a' },
    { label: "Somewhat important (I'm okay with KYC if needed).", value: 'answer7b' },
    { label: "Not important (I'm fine with standard procedures).", value: 'answer7c' },
  ];

  const question8Options = [
    {
      label: 'Yes, create and send me a SeedHammer metal backup and keep a copy for me.',
      value: 'answer8a',
    },
    { label: 'Yes, send a copy to my financial advisor or trusted contact.', value: 'answer8b' },
    { label: "Yes, but I'll handle my own backup.", value: 'answer8c' },
    { label: "No, I don't need a backup service.", value: 'answer8d' },
  ];

  const question9Options = [
    { label: "Yes, I'd like you to hold a key for recovery or inheritance.", value: 'answer9a' },
    { label: 'No, I want full control of all keys.', value: 'answer9b' },
    { label: "I'm not sure, explain the benefits.", value: 'answer9c' },
  ];

  const question10Options = [
    { label: "Yes, I'd like help setting up my wallet or node.", value: 'answer10a' },
    { label: "No, I'll set it up myself.", value: 'answer10b' },
    { label: "I'm not sure, tell me about the service.", value: 'answer10c' },
  ];

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value,
    }));
  };

  const generateRecommendations = () => {
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      question8,
      question9,
      question10,
    } = answers;

    if (
      !question1 ||
      !question2 ||
      !question3 ||
      !question4 ||
      !question5 ||
      !question6 ||
      !question7 ||
      !question8 ||
      !question9 ||
      !question10
    ) {
      return null;
    }

    let recommendations = [];

    // Question 1 logic
    if (question1 === 'answer1a') {
      recommendations.push({
        title: 'Bitcoin Custody & Security',
        content: [
          'Consider upgrading to a hardware wallet for enhanced security',
          'Implement multi-signature setups for large holdings',
          'Review your current wallet security practices',
          'Consider running your own node for privacy and validation',
        ],
      });
    } else if (question1 === 'answer1b') {
      recommendations.push({
        title: 'Getting Started with Bitcoin',
        content: [
          'Start with small amounts to learn the process',
          'Research different exchanges and their security practices',
          'Consider using a non-custodial wallet from day one',
          'Learn about Bitcoin security best practices before buying',
        ],
      });
    } else if (question1 === 'answer1c') {
      recommendations.push({
        title: 'Bitcoin Education & Research',
        content: [
          'Read "The Bitcoin Standard" by Saifedean Ammous',
          'Watch educational content from trusted Bitcoin educators',
          'Join Bitcoin communities to learn from others',
          'Start with paper wallets or small test transactions',
        ],
      });
    }

    // Question 2 logic
    if (question2 === 'answer2a') {
      recommendations.push({
        title: 'Beginner-Friendly Resources',
        content: [
          'Use simple mobile wallets like BlueWallet or Phoenix',
          'Start with small amounts to build confidence',
          'Focus on understanding basic concepts first',
          'Consider using Bitcoin-only services for simplicity',
        ],
      });
    } else if (question2 === 'answer2b') {
      recommendations.push({
        title: 'Intermediate Bitcoin Practices',
        content: [
          'Upgrade to a hardware wallet for better security',
          'Learn about Lightning Network for faster transactions',
          'Consider running a Bitcoin node',
          'Explore advanced privacy techniques',
        ],
      });
    } else if (question2 === 'answer2c') {
      recommendations.push({
        title: 'Advanced Bitcoin Strategies',
        content: [
          'Implement multi-signature setups',
          'Run your own Bitcoin node',
          'Explore Lightning Network routing',
          'Consider contributing to Bitcoin development',
        ],
      });
    }

    // Question 3 logic (multi-select)
    if (question3 && question3.length > 0) {
      const custodyGoals = [];

      if (question3.includes('answer3a')) {
        custodyGoals.push('Long-term storage solutions');
      }
      if (question3.includes('answer3b')) {
        custodyGoals.push('Frequent transaction capabilities');
      }
      if (question3.includes('answer3c')) {
        custodyGoals.push('Privacy-focused solutions');
      }
      if (question3.includes('answer3d')) {
        custodyGoals.push('Inheritance planning');
      }

      if (custodyGoals.length > 0) {
        recommendations.push({
          title: 'Custody Strategy Based on Your Goals',
          content: custodyGoals,
        });
      }
    }

    // Question 4 logic
    if (question4 === 'answer4a' || question4 === 'answer4b') {
      recommendations.push({
        title: 'Entry-Level Security',
        content: [
          'Mobile wallets are suitable for smaller amounts',
          'Consider a simple hardware wallet for enhanced security',
          'Focus on learning best practices before scaling up',
        ],
      });
    } else if (question4 === 'answer4c' || question4 === 'answer4d') {
      recommendations.push({
        title: 'Mid-Range Security Requirements',
        content: [
          'Hardware wallets are strongly recommended',
          'Consider multi-signature setups',
          'Implement proper backup strategies',
        ],
      });
    } else if (question4 === 'answer4e') {
      recommendations.push({
        title: 'High-Value Security Measures',
        content: [
          'Multi-signature setups are essential',
          'Consider professional custody services',
          'Implement comprehensive backup and recovery plans',
          'Regular security audits recommended',
        ],
      });
    }

    // Question 5 logic
    if (question5 === 'answer5a') {
      recommendations.push({
        title: 'DIY Bitcoin Management',
        content: [
          'Learn about hardware wallet setup and usage',
          'Understand backup and recovery procedures',
          'Consider running your own node for full sovereignty',
        ],
      });
    } else if (question5 === 'answer5b') {
      recommendations.push({
        title: 'Assisted Bitcoin Management',
        content: [
          'Consider collaborative custody solutions',
          'Get help with initial setup and configuration',
          'Learn gradually while maintaining some assistance',
        ],
      });
    } else if (question5 === 'answer5c') {
      recommendations.push({
        title: 'Guided Bitcoin Setup',
        content: [
          'Professional setup and configuration services',
          'Ongoing support and maintenance',
          'Regular security reviews and updates',
        ],
      });
    }

    // Question 6 logic
    if (question6 === 'answer6a') {
      recommendations.push({
        title: 'Single-Signature Wallet Recommendations',
        content: [
          'Consider ColdCard for air-gapped security',
          'Use a strong passphrase for additional protection',
          'Implement proper backup procedures',
          'Consider using a dedicated device for Bitcoin only',
        ],
      });
    } else if (question6 === 'answer6b') {
      recommendations.push({
        title: 'Multi-Signature Wallet Setup',
        content: [
          'Consider multi-sig with 2-of-3 or 3-of-5 setups',
          'Distribute keys across different locations',
          'Use hardware wallets for each key',
          'Implement proper key management procedures',
        ],
      });
    } else if (question6 === 'answer6c') {
      recommendations.push({
        title: 'Recommended Wallet Strategy',
        content: [
          'Start with single-sig for simplicity',
          'Gradually upgrade to multi-sig as you learn',
          'Consider your security needs and experience level',
          'Regularly review and update your setup',
        ],
      });
    }

    // Question 7 logic
    if (question7 === 'answer7a') {
      recommendations.push({
        title: 'Privacy-Focused Solutions',
        content: [
          'Consider non-KYC exchanges like Hodl Hodl',
          'Use privacy-focused wallets and techniques',
          'Learn about CoinJoin and other privacy tools',
          'Consider running your own node for privacy',
        ],
      });
    } else if (question7 === 'answer7b') {
      recommendations.push({
        title: 'Balanced Privacy Approach',
        content: [
          'Use reputable KYC exchanges for initial purchases',
          'Implement privacy practices where possible',
          'Consider privacy-focused wallets for storage',
          'Learn about privacy techniques gradually',
        ],
      });
    } else if (question7 === 'answer7c') {
      recommendations.push({
        title: 'Standard Security Practices',
        content: [
          'Use established exchanges like River or Coinbase',
          'Focus on security over privacy initially',
          'Implement standard backup procedures',
          'Consider hardware wallets for long-term storage',
        ],
      });
    }

    // Question 8 logic
    if (question8 === 'answer8a') {
      recommendations.push({
        title: 'SeedHammer Metal Backup Service',
        content: [
          "We'll create and send you a SeedHammer metal backup",
          "We'll keep a secure copy for recovery purposes",
          'Regular verification of backup integrity',
          'Secure storage of your backup copy',
        ],
      });
    } else if (question8 === 'answer8b') {
      recommendations.push({
        title: 'Third-Party Backup Arrangement',
        content: [
          'Coordinate with your financial advisor for backup storage',
          'Ensure proper legal documentation',
          'Regular verification of backup accessibility',
          'Clear communication protocols for recovery',
        ],
      });
    } else if (question8 === 'answer8c') {
      recommendations.push({
        title: 'Self-Managed Backup Strategy',
        content: [
          'Learn proper backup creation techniques',
          'Use multiple backup locations',
          'Regular testing of backup recovery',
          'Consider fireproof and waterproof storage',
        ],
      });
    } else if (question8 === 'answer8d') {
      recommendations.push({
        title: 'Backup Risk Assessment',
        content: [
          'Consider the risks of not having a backup',
          'Learn about backup best practices',
          'Start with simple backup methods',
          'Re-evaluate backup needs as holdings grow',
        ],
      });
    }

    // Question 9 logic
    if (question9 === 'answer9a') {
      recommendations.push({
        title: 'Collaborative Custody Setup',
        content: [
          'We can hold a key in your multi-sig setup',
          'Implement proper legal agreements',
          'Regular verification of key accessibility',
          'Clear procedures for inheritance or recovery',
        ],
      });
    } else if (question9 === 'answer9b') {
      recommendations.push({
        title: 'Full Control Strategy',
        content: [
          'Maintain complete control of all keys',
          'Implement robust backup procedures',
          'Consider inheritance planning carefully',
          'Regular security audits of your setup',
        ],
      });
    } else if (question9 === 'answer9c') {
      recommendations.push({
        title: 'Collaborative Custody Benefits',
        content: [
          'Professional key management and security',
          'Recovery assistance if keys are lost',
          'Inheritance planning and execution',
          'Reduced risk of total loss',
        ],
      });
    }

    // Question 10 logic
    if (question10 === 'answer10a') {
      recommendations.push({
        title: 'Concierge Service Benefits',
        content: [
          'Professional wallet and node setup',
          'Ongoing support and maintenance',
          'Security audits and updates',
          '24/7 assistance for critical issues',
        ],
      });
    } else if (question10 === 'answer10b') {
      recommendations.push({
        title: 'DIY Setup Resources',
        content: [
          'Comprehensive setup guides and tutorials',
          'Community support and forums',
          'Regular security best practices',
          'Consider professional help for complex setups',
        ],
      });
    } else if (question10 === 'answer10c') {
      recommendations.push({
        title: 'Concierge Service Overview',
        content: [
          'Professional setup and configuration',
          'Ongoing support and maintenance',
          'Security monitoring and updates',
          'Peace of mind for complex setups',
        ],
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Bitcoin Assessment Quiz</h2>
        <p className="text-gray-300 mb-6">
          Answer these questions to get personalized Bitcoin recommendations.
        </p>
      </div>

      <div className="space-y-8 mb-8">
        {/* Question 1 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            1. Do you currently own Bitcoin?
          </h3>
          <Dropdown
            value={answers.question1}
            onChange={e => handleAnswerChange('question1', e.value)}
            options={question1Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 2 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            2. What is your experience level with Bitcoin?
          </h3>
          <Dropdown
            value={answers.question2}
            onChange={e => handleAnswerChange('question2', e.value)}
            options={question2Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 3 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            3. What is your primary goal for Bitcoin custody?
          </h3>
          <MultiSelect
            value={answers.question3}
            onChange={e => handleAnswerChange('question3', e.value)}
            options={question3Options}
            placeholder="Select your goals (multiple choices allowed)"
            className="w-full"
            showSelectAll={false}
            pt={{
              panel: {
                className: 'py-0',
              },
              header: {
                className: 'hidden',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
              checkbox: {
                className: 'text-[#FF9500]',
              },
              checkboxBox: {
                className: 'border-[#FF9500]',
              },
              checkboxBoxHighlighed: {
                className: 'bg-[#FF9500] border-[#FF9500]',
              },
              checkboxIcon: {
                className: 'text-white',
              },
            }}
          />
        </div>

        {/* Question 4 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            4. How much Bitcoin are you looking to secure or purchase?
          </h3>
          <Dropdown
            value={answers.question4}
            onChange={e => handleAnswerChange('question4', e.value)}
            options={question4Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 5 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            5. Do you prefer managing your Bitcoin yourself or would you like some limited
            assistance?
          </h3>
          <Dropdown
            value={answers.question5}
            onChange={e => handleAnswerChange('question5', e.value)}
            options={question5Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 6 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            6. Do you have a preference for wallet type?
          </h3>
          <Dropdown
            value={answers.question6}
            onChange={e => handleAnswerChange('question6', e.value)}
            options={question6Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 7 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            7. How important is privacy to you?
          </h3>
          <Dropdown
            value={answers.question7}
            onChange={e => handleAnswerChange('question7', e.value)}
            options={question7Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 8 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            8. Would you like a backup solution for your wallet&apos;s seed phrase?
          </h3>
          <Dropdown
            value={answers.question8}
            onChange={e => handleAnswerChange('question8', e.value)}
            options={question8Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 9 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            9. Would you like for a third party to be able to co-sign a transaction in the future if
            needed?
          </h3>
          <Dropdown
            value={answers.question9}
            onChange={e => handleAnswerChange('question9', e.value)}
            options={question9Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>

        {/* Question 10 */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            10. Are you interested in a concierge service to help set up your wallet or node?
          </h3>
          <Dropdown
            value={answers.question10}
            onChange={e => handleAnswerChange('question10', e.value)}
            options={question10Options}
            placeholder="Select your answer"
            className="w-full"
            pt={{
              panel: {
                className: 'py-0 max-h-96',
              },
              triggerIcon: {
                className: 'text-[#FF9500]',
              },
            }}
          />
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6">Your Personalized Recommendations</h3>
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-orange-400 mb-3">{rec.title}</h4>
                <ul className="space-y-2">
                  {rec.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-300 flex items-start">
                      <span className="text-orange-400 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-600">
            <button
              onClick={() => window.print()}
              className="bg-orange-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
            >
              Print Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BitcoinQuiz;
