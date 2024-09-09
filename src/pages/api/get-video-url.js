import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  endpoint: "https://nyc3.digitaloceanspaces.com", // DigitalOcean Spaces endpoint
  region: "nyc3",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
})

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { videoKey } = req.query

  if (!videoKey) {
    return res.status(400).json({ error: "Video key is required" })
  }

  try {
    const command = new GetObjectCommand({
      Bucket: "plebdevs-bucket",
      Key: videoKey,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    })

    res.redirect(signedUrl)
  } catch (error) {
    console.error("Error generating signed URL:", error)
    res.status(500).json({ error: "Failed to generate video URL" })
  }
}