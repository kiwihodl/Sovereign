export const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() 
            ? <span key={index} className="bg-yellow-300 text-black">{part}</span> 
            : part
    );
};