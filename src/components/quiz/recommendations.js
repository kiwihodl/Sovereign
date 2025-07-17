const getCustodyGoalRecommendation = goals => {
  if (!goals || goals.length === 0) return '';

  let advice = '<h4>Aligning Your Setup with Your Goals</h4>';

  if (goals.includes('answer3a')) {
    advice +=
      '<p><b>For Long-Term Storage:</b> Your focus should be on robust, offline security. A hardware wallet, ideally in a multi-sig setup for larger amounts, is non-negotiable. Your backups must be resilient (e.g., steel plates) and geographically distributed.</p>';
  }
  if (goals.includes('answer3b')) {
    advice +=
      '<p><b>For Frequent Transactions:</b> While keeping a small amount in a "hot wallet" on a mobile Lightning wallet like Wallet of Satoshi or Zeus is fine for daily spending, your main stash should remain in cold storage. Do not day-trade from your primary hardware wallet.</p>';
  }
  if (goals.includes('answer3c')) {
    advice +=
      '<p><b>For Privacy:</b> Your strategy should involve non-KYC acquisition, running your own node, and using CoinJoin. This is an advanced path, but it offers the highest level of financial confidentiality.</p>';
  }
  if (goals.includes('answer3d')) {
    advice +=
      '<p><b>For Inheritance:</b> A multi-signature setup is the gold standard for inheritance. By distributing keys to your heir(s) and perhaps a trusted lawyer, you can create a robust plan that ensures your Bitcoin can be securely passed on. This requires careful planning and clear instructions.</p>';
  }
  if (goals.includes('answer3e')) {
    advice +=
      '<p><b>For Short-Term Investment:</b> Even if you plan to sell in the short term, holding your Bitcoin on an exchange exposes you to unnecessary risk (e.g., hacks, platform insolvency). Self-custody is still the safest option. Use a hardware wallet and only send funds to an exchange when you are actively making a trade.</p>';
  }

  return advice;
};

const getWalletRecommendation = (level, amount, walletType) => {
  let hardwareWallet = '';

  if (level === 'answer2c' || amount === 'answer4d' || amount === 'answer4e') {
    hardwareWallet = `
      <p>Given your advanced knowledge or the significant value you're securing, consider one of the following top-tier hardware wallets for robust security:</p>
      <ul>
        <li><b>Passport by Foundation:</b> A stateful, air-gapped device with a secure element, offering a great user experience.</li>
        <li><b>Coldcard Mk4 or Q by Coinkite:</b> Known for its extreme security features and air-gapped capabilities, ideal for multi-sig. The Q model adds QR code functionality.</li>
      </ul>
      <p>For a multi-signature setup, using a combination of different vendors (e.g., Passport, Coldcard, and Jade) is the gold standard for security, as it protects against supply-chain attacks from a single provider.</p>
    `;
  } else if (level === 'answer2b' || amount === 'answer4c') {
    hardwareWallet = `
      <p>You're at a stage where a hardware wallet is strongly recommended. This device keeps your private keys offline, protecting them from online threats. Here are some excellent options:</p>
      <ul>
      <li><b>ColadCard Mk4 or Q by Coinkite:</b> The most popular and trusted signing device by most bitcoiners, it is a user-friendly with optional advanced features, air-gapped wallet that is robust.</li>
        <li><b>Passport by Foundation:</b> An excellent, user-friendly, air-gapped wallet that will serve you well for years to come.</li>
        <li><b>Jade by Blockstream:</b> A great FOSS (Free and Open Source Software) option with a virtual secure element, backed by a highly reputable team. Its translucent case also helps in verifying the internal components.</li>
         <li><b>SeedSigner:</b> A great FOSS (Free and Open Source Software) DIY option, to mitigate supply chain attacks. It is incredibly important to verify your downloads as they do not have secure elements.</li>
      </ul>
      <p>Ordering to a PO Box instead of your home address adds a simple but effective layer of privacy against potential data leaks.</p>
    `;
  } else {
    hardwareWallet = `
      <p>While you're starting out, mobile wallets like <b>BlueWallet</b> or <b>Green Wallet</b> are great for handling small amounts. However, once you accumulate an amount that is significant to you (e.g., over $1,000), you should transition to a hardware wallet.</p>
      <p>A hardware wallet is a dedicated device that keeps your private keys completely offline, making it the most secure way to store your Bitcoin. Think of it as your personal vault.</p>
    `;
  }

  if (walletType === 'answer6b') {
    hardwareWallet += `
      <h4>Multi-Signature (Multi-Sig) Setup:</h4>
      <p>Since you've indicated an interest in multi-sig, it's crucial to understand that this is an advanced setup. It requires multiple keys (e.g., 2-of-3) to authorize a transaction, offering superior security against theft and coercion. This is the apex of security for large holdings and is best configured with guidance from an expert. Ensure you use hardware wallets from different vendors to maximize security.</p>
    `;
  }

  return hardwareWallet;
};

const getPrivacyRecommendation = privacyLevel => {
  if (privacyLevel === 'answer7a') {
    return `
      <h4>Enhancing Your Privacy</h4>
      <p>Your focus on privacy is wise. To minimize your digital footprint, consider these strategies:</p>
      <ul>
        <li><b>Non-KYC Bitcoin:</b> Acquire Bitcoin through peer-to-peer platforms like <strong>Hodl Hodl</strong> or at Bitcoin meetups. This avoids linking your identity to your coins.</li>
        <li><b>Run Your Own Node:</b> Connecting your wallet to your own Bitcoin node (using Sparrow Wallet) is the ultimate step for privacy. It prevents you from broadcasting your transaction data to public servers.</li>
        <li><b>CoinJoin:</b> Use tools like Whirlpool with Sparrow Wallet to mix your coins, breaking the chain of transaction history and making it difficult for outsiders to track your funds.</li>
      </ul>
    `;
  } else if (privacyLevel === 'answer7b') {
    return `
      <h4>A Balanced Approach to Privacy</h4>
      <p>It's good to be mindful of privacy. While using reputable exchanges like <strong>River (US)</strong> or <strong>AmberApp (Australia)</strong> is convenient for purchasing Bitcoin, you can still take steps to protect your privacy after the purchase:</p>
      <ul>
        <li><b>Use a Fresh Address:</b> Always provide a new, unused address from your own wallet when withdrawing from an exchange.</li>
        <li><b>Consider Coin Control:</b> Use a wallet like Sparrow that offers "coin control" (UTXO management). This prevents you from accidentally linking different sources of your Bitcoin when you make a transaction.</li>
      </ul>
    `;
  }
  return '';
};

const getBeginnerEducation = () => `
  <h4>Step 1: Understanding the Importance of Your Seed Phrase</h4>
  <p>Your "seed phrase" (or recovery phrase) is the master key to your Bitcoin wallet. To truly understand its power, let's do a quick, safe exercise. This will not be the wallet you use for your life savings, but a simple test.</p>
  <ol>
    <li>Download <strong>BlueWallet</strong> on your mobile phone.</li>
    <li>Create a new wallet. It will show you a 12-word seed phrase. <strong>Write it down carefully.</strong></li>
    <li>Send a very small amount of Bitcoin (e.g., $5) to this wallet from the exchange where you plan to buy.</li>
    <li>Now, download <strong>Green Wallet</strong> on your phone.</li>
    <li>Instead of creating a new wallet, choose "Restore a wallet" and enter the 12-word seed phrase you wrote down from BlueWallet.</li>
  </ol>
  <p>You will see your $5 worth of Bitcoin magically appear. This demonstrates that the private and public key pair precedes the wallet and is portable, you are not beholden to any wallet provider. <br/><br/>Anyone with your seed phrase can access the funds. This is why you must protect it above all else. With Bitcoin, knowledge is ownership.</p>
`;

const getSeedGenerationAdvice = (level, amount) => {
  let advice = `
    <h4>Step 2: Generating Your Master Key (Seed Phrase)</h4>
    <p>The most crucial step in self-custody is creating your seed phrase securely. Since you cannot easily verify the code inside a hardware wallet, generating your seed phrase offline eliminates trust in the manufacturer. This ensures your key is truly random.</p>
  `;

  if (
    level === 'answer2c' ||
    level === 'answer2b' ||
    amount === 'answer4d' ||
    amount === 'answer4e'
  ) {
    advice += `
      <p>We strongly recommend you generate your own 24-word seed phrase offline using one of these methods:</p>
      <ul>
        <li><b>SeedPicker Cards or Entropia Pills:</b> These tools use dice rolls or random pill draws to help you generate a truly random seed, removing any human bias.</li>
        <li><b>Manual Dice Rolls:</b> You can use standard dice and a BIP39 word list to generate your seed. It's a bit more involved, but it is the ultimate in trust minimization.</li>
      </ul>
      <p>A 24-word seed is significantly more secure than a 12-word one, offering a vast keyspace that is computationally impossible to brute force. After generating your 23 words, you'll use a device like a SeedSigner or Coldcard to calculate the final (24th) checksum word.</p>
      
      <h4>Step 3: Adding a Passphrase (Your 25th Word)</h4>
      <p>A passphrase is an optional, but highly recommended, "25th word" that creates a completely new, hidden wallet from your 24-word seed. If your seed words are ever compromised, the attacker still cannot access your funds without the passphrase. <strong>Warning: If you forget the passphrase, your Bitcoin is lost forever.</strong></p>
      <p>Your passphrase should be strong and memorable to you, but not easily guessable. Store it separately from your seed words.</p>
    `;
  } else {
    advice += `
      <p>For your first real wallet, you can let a trusted hardware wallet generate the seed phrase for you. However, as your holdings grow, you should plan to create a new wallet using the offline-generation methods described for intermediate and advanced users.</p>
      <p>Even as a beginner, you should add a passphrase to your hardware-wallet-generated seed. This provides a crucial layer of security.</p>
    `;
  }
  return advice;
};

const getBackupRecommendation = () => `
  <h4>Step 4: Backing Up Your Seed Phrase</h4>
  <p>Your seed phrase should be backed up on a medium that can withstand fire, flood, and time. Paper is not sufficient.</p>
  <ul>
    <li><b>Steel Plates:</b> Use a steel backup product like <strong>Seed Hammer</strong> or a <strong>Blockstream Capsule</strong> to stamp or etch your 24 words into metal.</li>
    <li><b>Geographic Distribution:</b> Do not store all your backups in one location. Consider splitting your seed phrase (e.g., two plates with 12 words each) and storing them with trusted family members or in separate, secure locations. This makes it incredibly difficult for a thief to reassemble your full key.</li>
    <li><b>Decoy Wallet:</b> Keep a separate wallet with a small amount of Bitcoin at home. In the unfortunate event of a home invasion, you can offer this decoy wallet to the attacker, protecting your main stash. The decoy wallet can be a completely different seed phrase, or the same seed phrase with a different passphrase. Ideally it is different to reduce the chances of the attacker trying to brute force your passphrase.</li>
  </ul>
`;

export const generateRecommendations = answers => {
  const { question1, question2, question3, question4, question6, question7 } = answers;

  if (!question1) {
    return null;
  }

  let finalReport = {
    title: 'Your Personalized Bitcoin Self-Custody Plan',
    sections: [],
  };

  // Section 1: Introduction based on Journey
  let intro = {
    title: 'Your Path to Financial Sovereignty',
    content: '',
  };
  if (question1 === 'journey_buying') {
    intro.content = `
      <p>Before you buy, it's a good idea to have a plan for securing your Bitcoin. The recommendations below will assist you through setting up your first secure wallet, so you can move your funds off the exchange immediately after purchase.</p>
      <p>For purchasing, we recommend reputable, Bitcoin-only exchanges like <strong>AmberApp (Australia)</strong>, <strong>River (US)</strong> or <strong>Bull Bitcoin (Canada, Europe)</strong>.</p>
      ${getBeginnerEducation()}
    `;
  } else if (question1 === 'journey_exchange') {
    intro.content = `
      <p>Congratulations on taking the most critical step: moving from an IOU on an exchange to true ownership of your Bitcoin. This journey from trusting a third party to verifying your own funds is the essence of what makes Bitcoin powerful. This plan will assist you with creating a secure vault.</p>
      ${getBeginnerEducation()}
    `;
  } else if (question1 === 'journey_improving') {
    intro.content = `
      <p>You've already embraced the core principle of Bitcoin: self-custody. Now, it's about refining your security model to protect against a wider range of threats as your holdings and knowledge grow. This plan will focus on advanced techniques to create a fortress around your wealth.</p>
    `;
  }
  finalReport.sections.push(intro);

  // Section 2: Wallet & Seed Generation
  const walletSetup = {
    title: 'Your Custody Setup: Wallet and Keys',
    content: `
      ${getSeedGenerationAdvice(question2, question4)}
      ${getWalletRecommendation(question2, question4, question6)}
    `,
  };
  finalReport.sections.push(walletSetup);

  // Section 2.5: Custody Goals
  const custodyGoals = {
    title: 'Tailoring Your Strategy to Your Goals',
    content: getCustodyGoalRecommendation(question3),
  };
  if (custodyGoals.content) {
    finalReport.sections.push(custodyGoals);
  }

  // Section 3: Backup Strategy
  const backupPlan = {
    title: 'Your Backup and Recovery Plan',
    content: getBackupRecommendation(),
  };
  finalReport.sections.push(backupPlan);

  // Section 4: Privacy
  const privacyPlan = {
    title: 'Privacy Considerations',
    content: getPrivacyRecommendation(question7),
  };
  if (privacyPlan.content) {
    finalReport.sections.push(privacyPlan);
  }

  // Section 5: Conclusion
  const conclusion = {
    title: 'Next Steps and Continuous Improvement',
    content: `
      <p>This plan provides a robust foundation for your Bitcoin self-custody. Remember, security is not a one-time setup, but an ongoing process. As your knowledge and the value of your holdings grow, continually reassess your threat model and improve your setup.</p>
      <p><strong>Don't trust, verify.</strong> Always verify the authenticity of any software you download. Sparrow Wallet makes this easy. Be skeptical, be diligent, and enjoy the peace of mind that comes with true financial sovereignty.</p>
    `,
  };
  finalReport.sections.push(conclusion);

  return [finalReport]; // Return as an array to match existing structure
};
