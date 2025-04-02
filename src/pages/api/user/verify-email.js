import prisma from '@/db/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, email, userId } = req.query;

    // Verify token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: email,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update user with verified email
    await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        emailVerified: new Date(),
      },
    });

    // Delete the used token using the token value
    await prisma.verificationToken.delete({
      where: {
        token: token, // Changed from id to token
      },
    });

    // Redirect to success page
    res.redirect('/profile?emailVerified=true');
  } catch (error) {
    console.error('Error verifying email:', error);
    res.redirect('/profile?error=VerificationFailed');
  }
}
