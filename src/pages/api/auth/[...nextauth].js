import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import NDK from "@nostr-dev-kit/ndk";
import axios from "axios";
import { findKind0Fields } from "@/utils/nostr";

const relayUrls = [
    "wss://nos.lol/",
    "wss://relay.damus.io/",
    "wss://relay.snort.social/",
    "wss://relay.nostr.band/",
    "wss://nostr.mutinywallet.com/",
    "wss://relay.mutinywallet.com/",
    "wss://relay.primal.net/"
];

const BASE_URL = process.env.BASE_URL;

// Initialize NDK
const ndk = new NDK({
    explicitRelayUrls: relayUrls,
});

export default NextAuth({
    providers: [
        CredentialsProvider({
            id: "nostr",
            name: "Nostr",
            credentials: {
                pubkey: { label: "Public Key", type: "text" },
            },
            authorize: async (credentials) => {
                if (credentials?.pubkey) {
                    await ndk.connect();

                    const user = ndk.getUser({ pubkey: credentials.pubkey });

                    try {
                        const profile = await user.fetchProfile();

                        // Check if user exists, create if not
                        const response = await axios.get(`${BASE_URL}/api/users/${credentials.pubkey}`);
                        if (response.status === 200 && response.data) {
                            return response.data;
                        } else if (response.status === 204) {
                            // Create user
                            if (profile) {
                                const fields = await findKind0Fields(profile);
                                const payload = { pubkey: credentials.pubkey, ...fields };

                                const createUserResponse = await axios.post(`${BASE_URL}/api/users`, payload);
                                return createUserResponse.data;
                            }
                        }
                    } catch (error) {
                        console.error("Nostr login error:", error);
                    }
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user; // Add user to token
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token.user; // Add user to session
            return session;
        },
        async redirect({ url, baseUrl }) {
            return url.split("/signin");
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: { jwt: true },
    jwt: {
        signingKey: process.env.JWT_SECRET,
    },
    pages: {
        signIn: "/auth/signin",
    },
});