import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setPubkey, setUsername } from "@/redux/reducers/userReducer";
import { generateSecretKey, getPublicKey } from 'nostr-tools';
import { findKind0Username } from "@/utils/nostr";

export const useLogin = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    // Handle Auto Login
    useEffect(() => {
        const autoLogin = async () => {
            const publicKey = window.localStorage.getItem('pubkey');
            console.log('Auto logging in with public key:', publicKey);

            if (!publicKey) return;

            try {
                const response = await axios.get(`/api/users/${publicKey}`);
                if (response.status === 200 && response.data) {
                    dispatch(setPubkey(publicKey));
                    if (response.data.username) {
                        dispatch(setUsername(response.data.username));
                    }
                    router.push('/');
                }
            } catch (error) {
                console.error('Error during auto login:', error);
            }
        };

        autoLogin();
    }, []);

    // Handle Nostr Login
    const nostrLogin = useCallback(async () => {
        if (!window || !window.nostr) {
            alert('Nostr is not available');
            return;
        }

        const publicKey = await window.nostr.getPublicKey();
        if (!publicKey) {
            alert('Failed to obtain public key');
            return;
        }

        try {
            const response = await axios.get(`/api/users/${publicKey}`);
            if (response.status !== 200) throw new Error('User not found');

            dispatch(setPubkey(publicKey));
            window.localStorage.setItem('pubkey', publicKey);
            if (response.data.username) dispatch(setUsername(response.data.username));
            router.push('/');
        } catch (error) {
            // User not found, create a new user
            const kind0 = await findKind0Username({ authors: [publicKey], kinds: [0] }); // Adjust based on actual implementation
            const username = kind0 ? kind0 : undefined;
            const payload = { pubkey: publicKey, ...(username && { username }) };

            try {
                const createUserResponse = await axios.post(`/api/users`, payload);
                if (createUserResponse.status === 201) {
                    dispatch(setPubkey(publicKey));
                    window.localStorage.setItem('pubkey', publicKey);
                    if (username) dispatch(setUsername(username));
                    router.push('/');
                } else {
                    alert('User not created');
                }
            } catch (createError) {
                console.error('Error creating user:', createError);
            }
        }
    }, [dispatch, router]);

    // Handle Anonymous Login
    const anonymousLogin = useCallback(() => {
        const secretKey = generateSecretKey();
        const publicKey = getPublicKey(secretKey);

        dispatch(setPubkey(publicKey));
        window.localStorage.setItem('pubkey', publicKey);
        window.localStorage.setItem('seckey', secretKey);
        router.push('/');
    }, [dispatch, router]);

    return { nostrLogin, anonymousLogin };
};
