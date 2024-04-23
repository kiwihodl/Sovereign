import {bech32} from 'bech32';

export const lnurlEncode = (data) => {
    console.log('data:', data);
    const words = bech32.toWords(Buffer.from(data, 'utf8'));
    return bech32.encode("lnurl", words, 2000).toUpperCase()
};

export const lnurlDecode = (encoded) => {
    const { words } = bech32.decode(encoded, 90);
    return Buffer.from(bech32.fromWords(words)).toString('utf8');
};