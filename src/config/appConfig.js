const appConfig = {
  defaultRelayUrls: [
    'wss://nos.lol/',
    'wss://relay.damus.io/',
    'wss://relay.snort.social/',
    'wss://relay.nostr.band/',
    'wss://relay.primal.net/',
    'wss://nostrue.com/',
    'wss://purplerelay.com/',
  ],
  authorPubkeys: [
    '4ce527eb7971b027723f684cabd3f14eb98047533410afaaf359408b93c0e033'
  ],
  customLightningAddresses: [
    {
      // todo remove need for lowercase
      // name will appear as name@plebdevs.com (lowercase)
      name: 'Kiwihodl',
      // If enabled, zaps are enabled
      allowsNostr: true,
      // make you're own lud06 metadata description
      description: "Kiwihodl's Lightning Address",
      // millisats
      maxSendable: 10000000000,
      // millisats
      minSendable: 1000,
      // Your LND invoice macaroon
      invoiceMacaroon: process.env.LND_MACAROON,
      // your LND TLS certificate (may be optional depending on your LND configuration)
      lndCert: '',
      // your LND host (do not include https:// or port)
      lndHost: process.env.LND_HOST,
      // your LND REST API port (default is 8080)
      lndPort: '8080',
    },
    {
      // todo remove need for lowercase
      // name will appear as name@plebdevs.com (lowercase)
      name: 'plebdevs',
      // If enabled, zaps are enabled
      allowsNostr: true,
      // make you're own lud06 metadata description
      description: 'plebdevs.com',
      // millisats
      maxSendable: 10000000000,
      // millisats
      minSendable: 1000,
      // Your LND invoice macaroon
      invoiceMacaroon: process.env.LND_MACAROON,
      // your LND TLS certificate (may be optional depending on your LND configuration)
      lndCert: '',
      // your LND host (do not include https:// or port)
      lndHost: process.env.LND_HOST,
      // your LND REST API port (default is 8080)
      lndPort: '8080',
    },
  ],
};

export default appConfig;
