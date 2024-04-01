import Bolt11Decoder from "light-bolt11-decoder"

export const getSatAmountFromInvoice = (invoice) => {
    const decoded = Bolt11Decoder.decode(invoice)
    return decoded.sections[2].value / 1000;
}