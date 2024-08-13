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

const ndk = new NDK({
    explicitRelayUrls: relayUrls,
});

const authorize = async (pubkey) => {
    await ndk.connect();
    const user = ndk.getUser({ pubkey });

    try {
        const profile = await user.fetchProfile();

        // Check if user exists, create if not
        const response = await axios.get(`${BASE_URL}/api/users/${pubkey}`);
        if (response.status === 200 && response.data) {
            const fields = await findKind0Fields(profile);

            // Combine user object with kind0Fields, giving priority to kind0Fields
            const combinedUser = { ...fields, ...response.data };

            // Update the user on the backend if necessary
            // await axios.put(`${BASE_URL}/api/users/${combinedUser.id}`, combinedUser);

            return combinedUser;
        } else if (response.status === 204) {
            // Create user
            if (profile) {
                const fields = await findKind0Fields(profile);
                console.log('FEEEEELDS', fields);
                const payload = { pubkey, ...fields };

                const createUserResponse = await axios.post(`${BASE_URL}/api/users`, payload);
                return createUserResponse.data;
            }
        }
    } catch (error) {
        console.error("Nostr login error:", error);
    }
    return null;
}


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
                    return await authorize(credentials.pubkey);
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, trigger, user }) {
            console.log('TRIGGER', trigger);
            if (trigger === "update") {
                // if we trigger an update call the authorize function again
                const newUser = await authorize(token.user.pubkey);
                token.user = newUser;
            }
            // Add combined user object to the token
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            // Add user from token to session
            session.user = token.user;
            session.jwt = token;
            return session;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl;
        },
        async signOut({ token, session }) {
            console.log('signOut', token, session);
            token = {}
            session = {}
            return true
          },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    jwt: {
        signingKey: process.env.JWT_SECRET,
    },
    pages: {
        signIn: "/auth/signin",
    },
});
