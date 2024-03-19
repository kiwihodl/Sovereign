import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            // Added a check to ensure the item is not only present but also a valid JSON string.
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            // Consider removing or correcting the invalid item in localStorage here.
            window.localStorage.removeItem(key); // Optional: remove the item that caused the error.
            return initialValue; // Revert to initial value if parsing fails.
        }
    });

    const setValue = value => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

export default useLocalStorage;
