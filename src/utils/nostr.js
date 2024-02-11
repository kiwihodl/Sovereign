export const findKind0Username = async (kind0) => {
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

    return username;
}