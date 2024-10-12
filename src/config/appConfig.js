const appConfig = {
    defaultRelayUrls: [
      // "wss://nos.lol/",
      // "wss://relay.damus.io/",
      // "wss://relay.snort.social/",
      // "wss://relay.nostr.band/",
      // "wss://relay.mutinywallet.com/",
      // "wss://relay.primal.net/",
      // "wss://nostr21.com/",
      // "wss://nostrue.com/",
      // "wss://purplerelay.com/",
      "wss://relay.devs.tools/"
    ],
    authorPubkeys: ["8cb60e215678879cda0bef4d5b3fc1a5c5925d2adb5d8c4fa7b7d03b5f2deaea", "676c02247668d5b18479be3d1a80933044256f3fbd03640a8c234684e641b6d6"],
    customLightningAddresses: [
      {
        // todo remove need for lowercase
        // name will appear as name@plebdevs.com (lowercase)
        name: "austin",
        // If enabled, zaps are enabled
        allowsNostr: true,
        // make you're own lud06 metadata description
        description: "Austin's Lightning Address",
        // millisats
        maxSendable: 10000000000,
        // millisats
        minSendable: 1000,
        // Your LND invoice macaroon
        invoiceMacaroon: process.env.LND_MACAROON,
        // your LND TLS certificate (may be optional depending on your LND configuration)
        lndCert: "",
        // your LND host (do not include https:// or port)
        lndHost: process.env.LND_HOST,
        // your LND REST API port (default is 8080)
        lndPort: "8080",
      },
    ],
  };
  
export default appConfig;