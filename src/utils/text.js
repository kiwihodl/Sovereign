export const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() 
            ? <span key={index} className="text-yellow-300">{part}</span> 
            : part
    );
};