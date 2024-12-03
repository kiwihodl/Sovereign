import { nip19 } from "nostr-tools";

export const findKind0Fields = async (kind0) => {
    let fields = {}

    const usernameProperties = ['name', 'displayName', 'display_name', 'username', 'handle', 'alias'];

    const pubkeyProperties = ['pubkey', 'npub', '_pubkey'];

    const findTruthyPropertyValue = (object, properties) => {
        for (const property of properties) {
            if (object?.[property]) {
                return object[property];
            }
        }
        return null;
    };

    const username = findTruthyPropertyValue(kind0, usernameProperties);

    if (username) {
        fields.username = username;
    }

    const avatar = findTruthyPropertyValue(kind0, ['picture', 'avatar', 'profilePicture', 'profile_picture', 'image']);

    if (avatar) {
        fields.avatar = avatar;
    }

    const pubkey = findTruthyPropertyValue(kind0, pubkeyProperties);

    if (pubkey) {
        fields.pubkey = pubkey;
    }

    const lud16 = findTruthyPropertyValue(kind0, ['lud16', 'lightning', 'lnurl', 'lnurlp', 'lnurlw']);

    if (lud16) {
        fields.lud16 = lud16;
    }

    return fields;
}

export const parseMessageEvent = (event) => {
    const eventData = {
        id: event.id,
        pubkey: event.pubkey || '',
        content: event.content || '',
        kind: event.kind || '',
        type: 'message',
    };

    return eventData;
}


export const parseEvent = (event) => {
    // Initialize an object to store the extracted data
    const eventData = {
        id: event.id,
        pubkey: event.pubkey || '',
        content: event.content || '',
        kind: event.kind || '',
        additionalLinks: [],
        title: '',
        summary: '',
        image: '',
        published_at: '',
        topics: [], // Added to hold all topics
        type: 'document', // Default type
    };

    // Iterate over the tags array to extract data
    event.tags.forEach(tag => {
        switch (tag[0]) { // Check the key in each key-value pair
            case 'title':
                eventData.title = tag[1];
                break;
            case 'summary':
                eventData.summary = tag[1];
                break;
            case 'description':
                eventData.summary = tag[1];
                break;
            case 'name':
                eventData.title = tag[1];
                break;
            case 'image':
                eventData.image = tag[1];
                break;
            case 'published_at':
                eventData.published_at = tag[1];
                break;
            case 'author':
                eventData.author = tag[1];
                break;
            case 'price':
                eventData.price = tag[1];
                break;
            // How do we get topics / tags?
            case 'l':
                // Grab index 1 and any subsequent elements in the array
                tag.slice(1).forEach(topic => {
                    eventData.topics.push(topic);
                });
                break;
            case 'd':
                eventData.d = tag[1];
                break;
            case 't':
                if (tag[1] === 'video') {
                    eventData.type = 'video';
                    eventData.topics.push(tag[1]);
                } else if (tag[1] !== "plebdevs") {
                    eventData.topics.push(tag[1]);
                }
                break;
            case 'r':
                eventData.additionalLinks.push(tag[1]);
                break;
            default:
                break;
        }
    });

    // if published_at is an empty string, then set it to event.created_at
    if (!eventData.published_at) {
        eventData.published_at = event.created_at;
    }

    return eventData;
};

export const parseCourseEvent = (event) => {
    // Initialize an object to store the extracted data
    const eventData = {
        id: event.id,
        pubkey: event.pubkey || '',
        content: event.content || '',
        kind: event.kind || '',
        name: '',
        description: '',
        image: '',
        published_at: '',
        created_at: event.created_at,
        topics: [],
        d: '',
        tags: event.tags,
        type: 'course',
    };

    // Iterate over the tags array to extract data
    event.tags.forEach(tag => {
        switch (tag[0]) { // Check the key in each key-value pair
            case 'name':
                eventData.name = tag[1];
                break;
            case 'title':
                eventData.name = tag[1];
                break;
            case 'description':
                eventData.description = tag[1];
                break;
            case 'about':
                eventData.description = tag[1];
                break;
            case 'image':
                eventData.image = tag[1];
                break;
            case 'picture':
                eventData.image = tag[1];
                break;
            case 'published_at':
                eventData.published_at = tag[1];
                break;
            case 'd':
                eventData.d = tag[1];
                break;
            case 'price':
                eventData.price = tag[1];
                break;
            // How do we get topics / tags?
            case 'l':
                // Grab index 1 and any subsequent elements in the array
                tag.slice(1).forEach(topic => {
                    eventData.topics.push(topic);
                });
                break;
            case 'r':
                eventData.additionalLinks.push(tag[1]);
                break;
            case 't':
                eventData.topics.push(tag[1]);
                break;
            default:
                break;
        }
    });

    return eventData;
}

export const hexToNpub = (hex) => {
    return nip19.npubEncode(hex);
}

export function validateEvent(event) {
    if (typeof event.kind !== "number") return "Invalid kind";
    if (typeof event.content !== "string") return "Invalid content";
    if (typeof event.created_at !== "number") return "Invalid created_at";
    if (typeof event.pubkey !== "string") return "Invalid pubkey";
    if (!event.pubkey.match(/^[a-f0-9]{64}$/)) return "Invalid pubkey format";

    if (!Array.isArray(event.tags)) return "Invalid tags";
    for (let i = 0; i < event.tags.length; i++) {
        const tag = event.tags[i];
        if (!Array.isArray(tag)) return "Invalid tag structure";
        for (let j = 0; j < tag.length; j++) {
            if (typeof tag[j] === "object") return "Invalid tag value";
        }
    }

    return true;
}
