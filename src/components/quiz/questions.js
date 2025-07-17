export const questions = [
  {
    id: 1,
    text: 'How would you describe your journey with Bitcoin so far?',
    type: 'dropdown',
    options: [
      { label: "I'm ready to buy my first Bitcoin.", value: 'journey_buying' },
      {
        label: 'I own Bitcoin on an exchange and want to learn self-custody.',
        value: 'journey_exchange',
      },
      {
        label: 'I already self-custody and want to improve my security.',
        value: 'journey_improving',
      },
    ],
  },
  {
    id: 2,
    text: 'What is your experience level with Bitcoin?',
    type: 'dropdown',
    options: [
      { label: 'Beginner - new to bitcoin, need simple solutions.', value: 'answer2a' },
      {
        label: 'Intermediate - familiar with wallets and basic security.',
        value: 'answer2b',
      },
      {
        label: 'Advanced - comfortable with hardware wallets, nodes, or multi-sig.',
        value: 'answer2c',
      },
    ],
  },
  {
    id: 3,
    text: 'What is your primary goal for Bitcoin custody?',
    type: 'multiselect',
    options: [
      { label: 'Long-term storage (hodling).', value: 'answer3a' },
      { label: 'Frequent transactions (e.g., trading or payments).', value: 'answer3b' },
      { label: 'Privacy and anonymity.', value: 'answer3c' },
      { label: 'Inheritance or estate planning.', value: 'answer3d' },
      { label: 'Short-term investment.', value: 'answer3e' },
    ],
  },
  {
    id: 4,
    text: 'How much Bitcoin are you looking to secure or purchase?',
    type: 'dropdown',
    options: [
      { label: 'Less than $1,000.', value: 'answer4a' },
      { label: '$1,000–$10,000.', value: 'answer4b' },
      { label: '$10,000–$50,000.', value: 'answer4c' },
      { label: '$50,000–$100,000.', value: 'answer4d' },
      { label: 'Over $100,000.', value: 'answer4e' },
      { label: 'Prefer not to say.', value: 'answer4f' },
    ],
  },
  {
    id: 5,
    text: 'Do you prefer managing your Bitcoin yourself or would you like some limited assistance?',
    type: 'dropdown',
    options: [
      { label: 'Full control (I want to manage my own keys).', value: 'answer5a' },
      {
        label: 'Independence with assistance (e.g., setup help or collaborative custody).',
        value: 'answer5b',
      },
      { label: 'I prefer a guided setup with ongoing support.', value: 'answer5c' },
    ],
  },
  {
    id: 6,
    text: 'Do you have a preference for wallet type?',
    type: 'dropdown',
    options: [
      { label: 'Single-signature wallet with a passphrase (simpler, one key).', value: 'answer6a' },
      { label: 'Multi-signature wallet (more secure, multiple keys).', value: 'answer6b' },
      { label: "No preference, recommend what's best for me.", value: 'answer6c' },
    ],
  },
  {
    id: 7,
    text: 'How important is privacy to you?',
    type: 'dropdown',
    options: [
      { label: 'Very important (I want to avoid KYC if possible).', value: 'answer7a' },
      { label: "Somewhat important (I'm okay with KYC if needed).", value: 'answer7b' },
      { label: "Not important (I'm fine with standard procedures).", value: 'answer7c' },
    ],
  },
  {
    id: 8,
    text: "Would you like a backup solution for your wallet's seed phrase?",
    type: 'dropdown',
    options: [
      {
        label: 'Yes, create and send me a SeedHammer metal backup and keep a copy for me.',
        value: 'answer8a',
      },
      { label: 'Yes, send a copy to my financial advisor or trusted contact.', value: 'answer8b' },
      { label: "Yes, but I'll handle my own backup.", value: 'answer8c' },
      { label: "No, I don't need a backup service.", value: 'answer8d' },
    ],
  },
  {
    id: 9,
    text: 'Would you like for a third party to be able to co-sign a transaction in the future if needed?',
    type: 'dropdown',
    options: [
      { label: "Yes, I'd like you to hold a key for recovery or inheritance.", value: 'answer9a' },
      { label: 'No, I want full control of all keys.', value: 'answer9b' },
      { label: "I'm not sure, explain the benefits.", value: 'answer9c' },
    ],
  },
  {
    id: 10,
    text: 'Are you interested in a concierge service to help set up your wallet or node?',
    type: 'dropdown',
    options: [
      { label: "Yes, I'd like help setting up my wallet or node.", value: 'answer10a' },
      { label: "No, I'll set it up myself.", value: 'answer10b' },
      { label: "I'm not sure, tell me about the service.", value: 'answer10c' },
    ],
  },
];
