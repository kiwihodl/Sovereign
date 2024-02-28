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
        content: event.content || '',
        title: '',
        summary: '',
        image: '',
        published_at: '',
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
            // Add cases for any other data you need to extract
        }
    });

    return eventData;
};
