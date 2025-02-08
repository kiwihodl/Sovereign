import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/db/prisma";
import { createTransport } from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { email, userId } = req.body;

        // Check if email is already in use
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Create verification token
        const token = await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: `${Math.random().toString(36).substring(2, 15)}`,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });

        // Create email transport
        const transport = createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD
            }
        });

        // Generate verification URL
        const baseUrl = process.env.BACKEND_URL;
        const verificationUrl = `${baseUrl}/api/user/verify-email?token=${token.token}&email=${email}&userId=${userId}`;

        // Send verification email
        await transport.sendMail({
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `Verify your email for PlebDevs`,
            text: `Click this link to verify your email: ${verificationUrl}`,
            html: `
                <body>
                    <div style="background: #f9f9f9; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px;">
                            <h2>Verify your email for PlebDevs</h2>
                            <p>Click the button below to verify your email address:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}"
                                   style="background: #4A5568; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Verify Email
                                </a>
                            </div>
                            <p style="color: #666; font-size: 14px;">
                                If you didn't request this email, you can safely ignore it.
                            </p>
                        </div>
                    </div>
                </body>
            `
        });

        // Don't update the user yet - wait for verification
        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Error linking email:', error);
        res.status(500).json({ error: 'Failed to link email' });
    }
} 