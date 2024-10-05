import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import NDK from "@nostr-dev-kit/ndk";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/db/prisma";
import { findKind0Fields } from "@/utils/nostr";
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { bytesToHex } from '@noble/hashes/utils'
import { updateUser, getUserByPubkey, createUser } from "@/db/models/userModels";
import { createRole } from "@/db/models/roleModels";
import appConfig from "@/config/appConfig";

// todo update EMAIL_FROM to be a plebdevs email
const ndk = new NDK({
    explicitRelayUrls: appConfig.defaultRelayUrls,
});

const authorize = async (pubkey) => {
    await ndk.connect();
    const user = ndk.getUser({ pubkey });

    try {
        const profile = await user.fetchProfile();

        // Check if user exists, create if not
        let dbUser = await getUserByPubkey(pubkey);

        if (dbUser) {
            const fields = await findKind0Fields(profile);
            // Only update 'avatar' or 'username' if they are different from kind0 fields on the dbUser
            const updatedFields = ['avatar', 'username'].reduce((acc, key) => {
                if (fields[key] !== dbUser[key]) {
                    acc[key] = fields[key];
                }
                return acc;
            }, {});

            // if there are updated fields, update the user only with the updated fields
            if (Object.keys(updatedFields).length > 0) {
                dbUser = await updateUser(dbUser.id, updatedFields);
            }

            // Combine user object with kind0Fields, giving priority to kind0Fields
            const combinedUser = { ...dbUser, kind0: fields };

            return combinedUser;
        } else {
            // Create user
            if (profile) {
                const fields = await findKind0Fields(profile);
                const payload = { pubkey, username: fields.username, avatar: fields.avatar };

                if (appConfig.authorPubkeys.includes(pubkey)) {
                    // create a new author role for this user
                    const createdUser = await createUser(payload);
                    const role = await createRole({
                        userId: createdUser.id,
                        admin: true,
                        subscribed: false,
                    });

                    if (!role) {
                        console.error("Failed to create role");
                        return null;
                    }

                    const updatedUser = await updateUser(createdUser.id, { role: role.id });
                    if (!updatedUser) {
                        console.error("Failed to update user");
                        return null;
                    }
                    
                    const fullUser = await getUserByPubkey(pubkey);

                    return { ...fullUser, kind0: fields };
                } else {
                    dbUser = await createUser(payload);
                    return { ...dbUser, kind0: fields };
                }
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
                    const updatedUser = await updateUser(token.user.id, { pubkey: pk, privkey: skHex });
                    if (!updatedUser) {
                        console.error("Failed to update user");
                        return null;
                    }
                    const fullUser = await getUserByPubkey(pk);
                    token.user = fullUser;
                } catch (error) {
                    console.error("Ephemeral key pair generation error:", error);
                    return null;
                }
            }
            
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
