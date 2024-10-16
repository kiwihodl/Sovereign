const event = {
    id: '123',
    content: 'encrypted_blob',
    created_at: 1714857600,
    kind: 30804,
    pubkey: 'pubkey',
    tags: [
        ["title", "title"],
        ["summary", "summary"],
        ["image", "image"],
        ["published_at", "published_at"],
        ["price", "price"],
        // This is an array in the format [ "price", "<number>", "<currency>", "<frequency>" ].
        // "price" is the name of the tag
        // "<number>" is the amount in numeric format (but included in the tag as a string)
        // "<currency>" is the currency unit in 3-character ISO 4217 format or ISO 4217-like currency code (e.g. "btc", "eth").
        // "<frequency>" is optional and can be used to describe recurring payments. SHOULD be in noun format (hour, day, week, month, year, etc.)
        ["location", "https://plebdevs.com/.well-known/lnurlp/austin/1234"],
    ],
    sig: 'sig'
};
