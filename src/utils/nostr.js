import { nip19 } from "nostr-tools";

export const findKind0Fields = async (kind0) => {
    let fields = {}

    const usernameProperties = ['name', 'displayName', 'display_name', 'username', 'handle', 'alias'];

    const findTruthyPropertyValue = (object, properties) => {
        for (const property of properties) {
            if (object[property]) {
                return object[property];
            }
        }
        return null;
    };

    const username = findTruthyPropertyValue(kind0, usernameProperties);

    if (username) {
        fields.username = username;
    }

    const avatar = findTruthyPropertyValue(kind0, ['picture', 'avatar', 'profilePicture', 'profile_picture']);

    if (avatar) {
        fields.avatar = avatar;
    }

    return fields;
}

export const parseEvent = (event) => {
    // Initialize an object to store the extracted data
    const eventData = {
        id: event.id,
        pubkey: event.pubkey || '',
        content: event.content || '',
        kind: event.kind || '',
        title: '',
        summary: '',
        image: '',
        published_at: '',
        topics: [], // Added to hold all topics
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
            case 'image':
                eventData.image = tag[1];
                break;
            case 'published_at':
                eventData.published_at = tag[1];
                break;
            case 'author':
                eventData.author = tag[1];
                break;
            case 'd':
                eventData.d = tag[1];
                break;
            case 't':
                tag[1] !== "plebdevs" && eventData.topics.push(tag[1]);
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
    console.log('event:', event);
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
        tags: event.tags
    };

    // Iterate over the tags array to extract data
    event.tags.forEach(tag => {
        switch (tag[0]) { // Check the key in each key-value pair
            case 'name':
                eventData.name = tag[1];
                break;
            case 'description':
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
            // How do we get topics / tags?
            case 'l':
                // Grab index 1 and any subsequent elements in the array
                tag.slice(1).forEach(topic => {
                    eventData.topics.push(topic);
                });
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
