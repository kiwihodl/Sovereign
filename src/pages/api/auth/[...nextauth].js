import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import NDK from "@nostr-dev-kit/ndk";
import axios from "axios";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/db/prisma";
import { findKind0Fields } from "@/utils/nostr";
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { bytesToHex } from '@noble/hashes/utils'
import { updateUser } from "@/db/models/userModels";
import { createRole } from "@/db/models/roleModels";

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
const AUTHOR_PUBKEY = process.env.AUTHOR_PUBKEY;

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

export const authOptions = {
    adapter: PrismaAdapter(prisma),
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
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM
        }),
    ],
    callbacks: {
        async jwt({ token, trigger, user }) {
            if (trigger === "update") {
                // if we trigger an update call the authorize function again
                const newUser = await authorize(token.user.pubkey);
                token.user = newUser;
            }
            // if the user has no pubkey, generate a new key pair
            if (token && token?.user && token?.user?.id && !token.user?.pubkey) {
                try {
                    let sk = generateSecretKey() 
                    let pk = getPublicKey(sk)
                    let skHex = bytesToHex(sk)
                    const updatedUser = await updateUser(token.user.id, {pubkey: pk, privkey: skHex});
                    if (!updatedUser) {
                        console.error("Failed to update user");
                        return null;
                    }
                    token.user = updatedUser;
                } catch (error) {
                    console.error("Ephemeral key pair generation error:", error);
                    return null;
                }
            }

            if (user && user?.pubkey === AUTHOR_PUBKEY && !user?.role) {
                // create a new author role for this user
                const role = await createRole({
                    userId: user.id,
                    admin: true,
                    subscribed: false,
                });

                if (!role) {
                    console.error("Failed to create role");
                    return null;
                }

                const updatedUser = await updateUser(user.id, {role: role.id});
                if (!updatedUser) {
                    console.error("Failed to update user");
                    return null;
                }
                token.user = updatedUser;
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
    }
};

export default NextAuth(authOptions);
