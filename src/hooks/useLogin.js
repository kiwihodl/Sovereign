import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNostr } from './useNostr';
import axios from 'axios';
import { generateSecretKey, getPublicKey } from 'nostr-tools';
import { findKind0Fields } from "@/utils/nostr";
import { useToast } from './useToast';

export const useLogin = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const { fetchKind0 } = useNostr();

    // Attempt Auto Login on render
    useEffect(() => {
        const autoLogin = async () => {
            const user = window.localStorage.getItem('user');
            const publicKey = JSON.parse(user)?.pubkey;

            if (!publicKey) return;

            try {
                const response = await axios.get(`/api/users/${publicKey}`);
                console.log('auto login response:', response);
                if (response.status === 200 && response.data) {
                    window.localStorage.setItem('user', JSON.stringify(response.data));
                } else if (response.status === 204) {
                    // User not found, create a new user
                    const kind0 = await fetchKind0(publicKey);

                    console.log('kind0:', kind0);

                    let fields = null;

                    if (kind0) {
                        fields = await findKind0Fields(kind0);
                    }

                    const payload = { pubkey: publicKey, ...fields };

                    try {
                        const createUserResponse = await axios.post(`/api/users`, payload);
                        console.log('create user response:', createUserResponse);
                        if (createUserResponse.status === 201) {
                            window.localStorage.setItem('user', JSON.stringify(createUserResponse.data));
                        } else {
                            console.error('Error creating user:', createUserResponse);
                        }
                    } catch (createError) {
                        console.error('Error creating user:', createError);
                        showToast('error', 'Error Creating User', 'Failed to create user');
                    }
                }
            } catch (error) {
                console.error('Error during auto login:', error);
            }
        };

        autoLogin();
    }, []);

    const nostrLogin = useCallback(async () => {
        if (!window || !window.nostr) {
          showToast('error', 'Nostr Unavailable', 'Nostr is not available');
          return;
        }
      
        const publicKey = await window.nostr.getPublicKey();
        if (!publicKey) {
          showToast('error', 'Public Key Error', 'Failed to obtain public key');
          return;
        }
      
        try {
          const response = await axios.get(`/api/users/${publicKey}`);
          let userData;
      
          if (response.status === 204) {
            // User not found, create a new user
            const kind0 = await fetchKind0(publicKey);
      
            let fields = {};
            if (kind0) {
              fields = await findKind0Fields(kind0);
            }
      
            const payload = { pubkey: publicKey, ...fields };
            const createUserResponse = await axios.post(`/api/users`, payload);
            if (createUserResponse.status !== 201) {
              throw new Error('Failed to create user');
            }
            userData = createUserResponse.data;
          } else {
            userData = response.data;
          }
      
          window.localStorage.setItem('user', JSON.stringify(userData));
          router.push('/').then(() => window.location.reload());
        } catch (error) {
          console.error('Error during login:', error);
          showToast('error', 'Login Error', error.message || 'Failed to log in');
        }
      }, [router, showToast, fetchKind0]);

    const anonymousLogin = useCallback(() => {
        try {
            const secretKey = generateSecretKey();
            const publicKey = getPublicKey(secretKey);
            // need to fix with byteToHex
            const hexSecretKey = secretKey.toString('hex');

            window.localStorage.setItem('user', JSON.stringify({ pubkey: publicKey, secretKey: hexSecretKey }));
            router.push('/').then(() => window.location.reload());
        } catch (error) {
            console.error('Error during anonymous login:', error);
            showToast('error', 'Error Logging In', 'Failed to log in');
        }
    }, [router, showToast]);

    return { nostrLogin, anonymousLogin };
};
