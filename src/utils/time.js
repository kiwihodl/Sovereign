export const formatUnixTimestamp = (time) => {
    const date = new Date(time * 1000); // Convert to milliseconds
    return date.toDateString();
}
