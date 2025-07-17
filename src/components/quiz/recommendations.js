export const generateRecommendations = answers => {
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

  // For testing: show all recommendations regardless of answers
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
  if (question3 && Array.isArray(question3) && question3.length > 0) {
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

  // For testing: show all possible recommendations
  recommendations = [
    // Question 1 recommendations
    {
      title: 'Bitcoin Custody & Security (Q1: Own Bitcoin)',
      content: [
        'Consider upgrading to a hardware wallet for enhanced security',
        'Implement multi-signature setups for large holdings',
        'Review your current wallet security practices',
        'Consider running your own node for privacy and validation',
      ],
    },
    {
      title: 'Getting Started with Bitcoin (Q1: Want to Buy)',
      content: [
        'Start with small amounts to learn the process',
        'Research different exchanges and their security practices',
        'Consider using a non-custodial wallet from day one',
        'Learn about Bitcoin security best practices before buying',
      ],
    },
    {
      title: 'Bitcoin Education & Research (Q1: Exploring)',
      content: [
        'Read "The Bitcoin Standard" by Saifedean Ammous',
        'Watch educational content from trusted Bitcoin educators',
        'Join Bitcoin communities to learn from others',
        'Start with paper wallets or small test transactions',
      ],
    },

    // Question 2 recommendations
    {
      title: 'Beginner-Friendly Resources (Q2: Beginner)',
      content: [
        'Use simple mobile wallets like BlueWallet or Phoenix',
        'Start with small amounts to build confidence',
        'Focus on understanding basic concepts first',
        'Consider using Bitcoin-only services for simplicity',
      ],
    },
    {
      title: 'Intermediate Bitcoin Practices (Q2: Intermediate)',
      content: [
        'Upgrade to a hardware wallet for better security',
        'Learn about Lightning Network for faster transactions',
        'Consider running a Bitcoin node',
        'Explore advanced privacy techniques',
      ],
    },
    {
      title: 'Advanced Bitcoin Strategies (Q2: Advanced)',
      content: [
        'Implement multi-signature setups',
        'Run your own Bitcoin node',
        'Explore Lightning Network routing',
        'Consider contributing to Bitcoin development',
      ],
    },

    // Question 3 recommendations
    {
      title: 'Custody Strategy: Long-term Storage (Q3: Hodling)',
      content: [
        'Hardware wallets for cold storage',
        'Multi-signature setups for large amounts',
        'Robust backup procedures',
        'Regular security audits',
      ],
    },
    {
      title: 'Custody Strategy: Frequent Transactions (Q3: Trading)',
      content: [
        'Hot wallets for daily transactions',
        'Lightning Network for speed',
        'Mobile wallets for convenience',
        'Regular security updates',
      ],
    },
    {
      title: 'Custody Strategy: Privacy Focus (Q3: Privacy)',
      content: [
        'Privacy-focused wallets',
        'CoinJoin techniques',
        'Running your own node',
        'Avoiding KYC exchanges',
      ],
    },
    {
      title: 'Custody Strategy: Inheritance Planning (Q3: Estate)',
      content: [
        'Multi-signature with trusted parties',
        'Legal documentation',
        'Clear inheritance procedures',
        'Regular key verification',
      ],
    },

    // Question 4 recommendations
    {
      title: 'Entry-Level Security (Q4: <$10k)',
      content: [
        'Mobile wallets are suitable for smaller amounts',
        'Consider a simple hardware wallet for enhanced security',
        'Focus on learning best practices before scaling up',
      ],
    },
    {
      title: 'Mid-Range Security Requirements (Q4: $10k-$100k)',
      content: [
        'Hardware wallets are strongly recommended',
        'Consider multi-signature setups',
        'Implement proper backup strategies',
      ],
    },
    {
      title: 'High-Value Security Measures (Q4: >$100k)',
      content: [
        'Multi-signature setups are essential',
        'Consider professional custody services',
        'Implement comprehensive backup and recovery plans',
        'Regular security audits recommended',
      ],
    },

    // Question 5 recommendations
    {
      title: 'DIY Bitcoin Management (Q5: Full Control)',
      content: [
        'Learn about hardware wallet setup and usage',
        'Understand backup and recovery procedures',
        'Consider running your own node for full sovereignty',
      ],
    },
    {
      title: 'Assisted Bitcoin Management (Q5: Independence with Help)',
      content: [
        'Consider collaborative custody solutions',
        'Get help with initial setup and configuration',
        'Learn gradually while maintaining some assistance',
      ],
    },
    {
      title: 'Guided Bitcoin Setup (Q5: Guided Setup)',
      content: [
        'Professional setup and configuration services',
        'Ongoing support and maintenance',
        'Regular security reviews and updates',
      ],
    },

    // Question 6 recommendations
    {
      title: 'Single-Signature Wallet Recommendations (Q6: Single-sig)',
      content: [
        'Consider ColdCard for air-gapped security',
        'Use a strong passphrase for additional protection',
        'Implement proper backup procedures',
        'Consider using a dedicated device for Bitcoin only',
      ],
    },
    {
      title: 'Multi-Signature Wallet Setup (Q6: Multi-sig)',
      content: [
        'Consider multi-sig with 2-of-3 or 3-of-5 setups',
        'Distribute keys across different locations',
        'Use hardware wallets for each key',
        'Implement proper key management procedures',
      ],
    },
    {
      title: 'Recommended Wallet Strategy (Q6: No Preference)',
      content: [
        'Start with single-sig for simplicity',
        'Gradually upgrade to multi-sig as you learn',
        'Consider your security needs and experience level',
        'Regularly review and update your setup',
      ],
    },

    // Question 7 recommendations
    {
      title: 'Privacy-Focused Solutions (Q7: Very Important)',
      content: [
        'Consider non-KYC exchanges like Hodl Hodl',
        'Use privacy-focused wallets and techniques',
        'Learn about CoinJoin and other privacy tools',
        'Consider running your own node for privacy',
      ],
    },
    {
      title: 'Balanced Privacy Approach (Q7: Somewhat Important)',
      content: [
        'Use reputable KYC exchanges for initial purchases',
        'Implement privacy practices where possible',
        'Consider privacy-focused wallets for storage',
        'Learn about privacy techniques gradually',
      ],
    },
    {
      title: 'Standard Security Practices (Q7: Not Important)',
      content: [
        'Use established exchanges like River or Coinbase',
        'Focus on security over privacy initially',
        'Implement standard backup procedures',
        'Consider hardware wallets for long-term storage',
      ],
    },

    // Question 8 recommendations
    {
      title: 'SeedHammer Metal Backup Service (Q8: SeedHammer)',
      content: [
        "We'll create and send you a SeedHammer metal backup",
        "We'll keep a secure copy for recovery purposes",
        'Regular verification of backup integrity',
        'Secure storage of your backup copy',
      ],
    },
    {
      title: 'Third-Party Backup Arrangement (Q8: Financial Advisor)',
      content: [
        'Coordinate with your financial advisor for backup storage',
        'Ensure proper legal documentation',
        'Regular verification of backup accessibility',
        'Clear communication protocols for recovery',
      ],
    },
    {
      title: 'Self-Managed Backup Strategy (Q8: Self-Managed)',
      content: [
        'Learn proper backup creation techniques',
        'Use multiple backup locations',
        'Regular testing of backup recovery',
        'Consider fireproof and waterproof storage',
      ],
    },
    {
      title: 'Backup Risk Assessment (Q8: No Backup)',
      content: [
        'Consider the risks of not having a backup',
        'Learn about backup best practices',
        'Start with simple backup methods',
        'Re-evaluate backup needs as holdings grow',
      ],
    },

    // Question 9 recommendations
    {
      title: 'Collaborative Custody Setup (Q9: Third Party Co-sign)',
      content: [
        'We can hold a key in your multi-sig setup',
        'Implement proper legal agreements',
        'Regular verification of key accessibility',
        'Clear procedures for inheritance or recovery',
      ],
    },
    {
      title: 'Full Control Strategy (Q9: Full Control)',
      content: [
        'Maintain complete control of all keys',
        'Implement robust backup procedures',
        'Consider inheritance planning carefully',
        'Regular security audits of your setup',
      ],
    },
    {
      title: 'Collaborative Custody Benefits (Q9: Not Sure)',
      content: [
        'Professional key management and security',
        'Recovery assistance if keys are lost',
        'Inheritance planning and execution',
        'Reduced risk of total loss',
      ],
    },

    // Question 10 recommendations
    {
      title: 'Concierge Service Benefits (Q10: Want Help)',
      content: [
        'Professional wallet and node setup',
        'Ongoing support and maintenance',
        'Security audits and updates',
        '24/7 assistance for critical issues',
      ],
    },
    {
      title: 'DIY Setup Resources (Q10: Self Setup)',
      content: [
        'Comprehensive setup guides and tutorials',
        'Community support and forums',
        'Regular security best practices',
        'Consider professional help for complex setups',
      ],
    },
    {
      title: 'Concierge Service Overview (Q10: Not Sure)',
      content: [
        'Professional setup and configuration',
        'Ongoing support and maintenance',
        'Security monitoring and updates',
        'Peace of mind for complex setups',
      ],
    },
  ];

  return recommendations;
};
