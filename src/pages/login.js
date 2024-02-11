import React from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { Button } from 'primereact/button';
import { useToast } from "@/hooks/useToast";
import { useNostr } from "@/hooks/useNostr";
import { findKind0Username } from "@/utils/nostr";
import { setPubkey, setUsername } from "@/redux/reducers/userReducer";

const Login = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { showToast } = useToast();

    const nostrLogin = async () => {
        try {
            if (!window || !window.nostr) {
                throw new Error('Nostr is not available');
            }

            const publicKey = await window.nostr.getPublicKey();
            if (!publicKey) {
                throw new Error('Failed to obtain public key');
            }

            try {
                const response = await axios.get(`/api/users/${publicKey}`);
                if (response.status === 200 && response.data) {
                    dispatch(setPubkey(publicKey));
                    if (response.data.username) {
                        dispatch(setUsername(response.data.username));
                    }
                    router.push('/');
                    return;
                }
            } catch (error) {
                if (error.response?.status !== 204) {
                    throw error; // Rethrow error if it's not the expected 204 status
                }

                // Handle user creation if status is 204 (No Content)
                const kind0 = await fetchKind0([{ authors: [publicKey], kinds: [0] }], {});
                const username = kind0 ? await findKind0Username(kind0) : undefined;
                const payload = { pubkey: publicKey, ...(username && { username }) };

                const createUserResponse = await axios.post(`/api/users`, payload);
                if (createUserResponse.status === 201) {
                    dispatch(setPubkey(publicKey));
                    if (username) {
                        dispatch(setUsername(username));
                    }
                    router.push('/');
                } else {
                    showToast('error', 'Error', 'User not created');
                }
            }
        } catch (error) {
            showToast('error', 'Error', error.message || 'An unexpected error occurred');
        }
    };

    return (
        <div className="w-fit mx-auto mt-24 flex flex-col justify-center">
            <h1 className="text-center mb-8">Login</h1>
            <Button
                label={"login with nostr"}
                icon="pi pi-user"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
                onClick={nostrLogin}
            />
            <Button
                label={"login anonymously"}
                icon="pi pi-user"
                className="text-[#f8f8ff] w-[250px] my-4"
                rounded
            />
        </div>
    )
}

export default Login;