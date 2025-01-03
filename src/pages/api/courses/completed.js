import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/db/prisma";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { userId } = req.query;

        const completedCourses = await prisma.userCourse.findMany({
            where: {
                userId: userId,
                completed: true,
            },
            include: {
                course: {
                    include: {
                        badge: true,
                    },
                },
            },
        });

        return res.status(200).json(completedCourses);
    } catch (error) {
        console.error('Error fetching completed courses:', error);
        return res.status(500).json({ error: 'Failed to fetch completed courses' });
    }
} 