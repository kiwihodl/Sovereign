import Bolt11Decoder from "light-bolt11-decoder"

export const getSatAmountFromInvoice = (invoice) => {
    const decoded = Bolt11Decoder.decode(invoice)
    return decoded.sections[2].value / 1000;
}

export const getTotalFromZaps = (zaps, event) => {
    let total = 0;
    let uniqueZaps = new Set();
    zaps.forEach((zap) => {
      // If the zap matches the event or the parameterized event, then add the zap to the total
      if ((zap.tags.find(tag => tag[0] === "e" && tag[1] === event.id) || zap.tags.find(tag => tag[0] === "a" && tag[1] === `${event.kind}:${event.pubkey}:${event.d}`)) &&!uniqueZaps.has(zap.id)) {
        uniqueZaps.add(zap.id);
        const bolt11Tag = zap.tags.find(tag => tag[0] === "bolt11");
        const invoice = bolt11Tag ? bolt11Tag[1] : null;
        if (invoice) {
          const amount = getSatAmountFromInvoice(invoice);
          total += amount;
        }
      }
    });
    return total;
}