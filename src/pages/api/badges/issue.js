import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/db/prisma";
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import { nip19 } from 'nostr-tools';
import { Buffer } from 'buffer';
import appConfig from "@/config/appConfig";

const hexToBytes = (hex) => {
  return Buffer.from(hex, 'hex');
};

const BADGE_AWARD_KIND = 8;
const BADGE_DEFINITION_KIND = 30009;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { courseId, userId } = req.body;

    // Verify course completion and get badge details
    const userCourse = await prisma.userCourse.findFirst({
      where: {
        userId,
        courseId,
        completed: true,
      },
      include: {
        course: {
          include: {
            badge: true,
          },
        },
        user: true, // Include user to get pubkey
      },
    });

    if (!userCourse) {
      return res.status(400).json({ error: 'Course not completed' });
    }

    if (!userCourse.course.badge) {
      return res.status(400).json({ error: 'No badge defined for this course' });
    }

    let noteId = userCourse.course.badge.noteId;

    if (noteId && noteId.startsWith("naddr")) {
      const naddr = nip19.decode(noteId);
      noteId = `${naddr.data.kind}:${naddr.data.pubkey}:${naddr.data.identifier}`;
    }

    // Check if badge already exists
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: userCourse.course.badge.id,
      },
    });

    if (existingBadge) {
      return res.status(400).json({ error: 'Badge already awarded' });
    }

    // Get the signing key from environment and convert to bytes
    const signingKey = process.env.BADGE_SIGNING_KEY;
    if (!signingKey) {
      throw new Error('Signing key not configured');
    }
    const signingKeyBytes = hexToBytes(signingKey);

    // Create event template
    const eventTemplate = {
      kind: BADGE_AWARD_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['p', userCourse.user.pubkey],
        ['a', noteId],
        ['d', `course-completion-${userCourse.course.id}`],
      ],
      content: JSON.stringify({
        name: userCourse.course.badge.name,
        description: `Completed ${userCourse.course.id}`,
        image: userCourse.course.badge.noteId,
        course: courseId,
        awardedAt: new Date().toISOString(),
      })
    };

    // Add validation for required fields
    if (!userCourse.user.pubkey || !noteId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Pubkey and noteId are required' 
      });
    }

    // Finalize (sign) the event
    const signedEvent = finalizeEvent(eventTemplate, signingKeyBytes);

    // Verify the event
    const isValid = verifyEvent(signedEvent);
    if (!isValid) {
      throw new Error('Event validation failed');
    }

    // Initialize pool and publish to relays
    const pool = new SimplePool();
    
    let published = false;
    try {
      await Promise.any(pool.publish(appConfig.defaultRelayUrls, signedEvent));
      published = true;
      console.log('Event published to at least one relay');
    } catch (error) {
      throw new Error('Failed to publish to any relay');
    } finally {
      // Add a small delay before closing the pool
      if (published) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await pool.close(appConfig.defaultRelayUrls); // Pass the relays array to close()
    }

    // Store badge in database
    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: userCourse.course.badge.id,
        awardedAt: new Date(),
      },
      include: {
        badge: true,
      },
    });

    return res.status(200).json({ 
      success: true, 
      userBadge,
      event: signedEvent 
    });

  } catch (error) {
    console.error('Error issuing badge:', error);
    return res.status(500).json({ 
      error: 'Failed to issue badge',
      message: error.message 
    });
  }
}