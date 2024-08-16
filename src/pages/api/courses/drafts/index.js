import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { userId, title, summary, image, price, topics, resourceIds } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const courseDraft = await prisma.courseDraft.create({
                data: {
                    title,
                    summary,
                    image,
                    price,
                    topics: topics || [],
                    user: { connect: { id: userId } },
                    resources: {
                        connect: resourceIds ? resourceIds.map(id => ({ id })) : []
                    }
                },
                include: { resources: true }
            });

            res.status(201).json(courseDraft);
        } catch (error) {
            console.error('Error creating course draft:', error);
            res.status(500).json({ error: 'Failed to create course draft', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}