export const formatUnixTimestamp = (time) => {
    const date = new Date(time * 1000); // Convert to milliseconds
    return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);

    // Example: Format to a more readable string
    const formattedDate = date.toLocaleString("en-US", {
        timeZone: "UTC", // Optional: You can change this to the user's time zone if needed
        weekday: "long", // "long" for full name, "short" for abbreviated
        year: "numeric",
        month: "long", // "long" for full name, "short" for abbreviated
        day: "numeric"
    });

    return formattedDate;
}

export const formatTimestampToHowLongAgo = (time) => {
    const date = new Date(time * 1000);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
}
