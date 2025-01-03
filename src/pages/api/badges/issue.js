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

    const { courseId, badgeId, userId } = req.body;

    let badge;
    if (courseId && courseId !== null && courseId !== undefined) {
      // Existing course badge logic
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
          user: true,
        },
      });

      if (!userCourse) {
        return res.status(400).json({ error: 'Course not completed' });
      }

      // Check if course requires repo submission
      if (userCourse.course.submissionRequired && !userCourse.submittedRepoLink) {
        return res.status(400).json({ 
          error: 'Repository submission required',
          message: 'You must submit a project repository to earn this badge'
        });
      }

      badge = userCourse.course.badge;
    } else if (badgeId) {
      // Direct badge lookup for non-course badges
      badge = await prisma.badge.findUnique({
        where: { id: badgeId },
        include: { userBadges: true },
      });

      if (!badge) {
        return res.status(400).json({ error: 'Badge not found' });
      }
    } else {
      return res.status(400).json({ error: 'Either courseId or badgeId is required' });
    }

    // Check if badge already exists
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: badge.id,
      },
    });

    if (existingBadge) {
      return res.status(400).json({ error: 'Badge already awarded' });
    }

    // Get user for pubkey
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    let noteId = badge.noteId;

    if (noteId && noteId.startsWith("naddr")) {
      const naddr = nip19.decode(noteId);
      noteId = `${naddr.data.kind}:${naddr.data.pubkey}:${naddr.data.identifier}`;
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
        ['p', user.pubkey],
        ['a', noteId],
        ['d', `plebdevs-badge-award-${session.user.id}`],
      ],
      content: ""
    };

    // Add validation for required fields
    if (!user.pubkey || !noteId) {
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
        badgeId: badge.id,
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