import React, { useEffect } from "react";
import { nip19 } from "nostr-tools";
import { defaultRelayUrls } from "@/context/NDKContext";

const ZapForm = ({ event }) => {
    const nAddress = nip19.naddrEncode({
        kind: event?.kind,
        pubkey: event?.pubkey,
        identifier: event.d,
        relays: [...defaultRelayUrls]
    });

    return (
        <iframe
            src={`https://zapper.nostrapps.org/zap?id=${nAddress}`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="zapper app"
        ></iframe>
    );
};

export default ZapForm;
