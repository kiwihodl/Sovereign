import { useState, useEffect } from 'react';

// This version of the hook initializes state without immediately attempting to read from localStorage
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(initialValue);

    // Function to update localStorage and state
    const setValue = value => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore); // Update state
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore)); // Update localStorage
            }
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

// Custom hook to handle fetching and setting data from localStorage
export function useLocalStorageWithEffect(key, initialValue) {
    const [storedValue, setStoredValue] = useLocalStorage(key, initialValue);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            const item = window.localStorage.getItem(key);
            // Only update if the item exists to prevent overwriting the initial value with null
            if (item !== null) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.log(error);
        }
    }, [key]); // Dependencies array ensures this runs once on mount

    return [storedValue, setStoredValue];
}

export default useLocalStorage;