import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { getLessonsByCourseId } from "@/db/models/lessonModels"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import appConfig from "@/config/appConfig";

const s3Client = new S3Client({
  endpoint: "https://nyc3.digitaloceanspaces.com", // DigitalOcean Spaces endpoint
  region: "nyc3",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
})

export default async function handler(req, res) {
  try {
    // Check if the request method is GET
    if (req.method !== 'GET') {
      return res.status(405).json({ error: "Method Not Allowed" })
    }

    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { videoKey } = req.query

    if (!videoKey || typeof videoKey !== 'string') {
      return res.status(400).json({ error: "Invalid or missing video key" })
    }

    // Check if the user is authorized to access the video
    if (!session.user.role?.subscribed && !appConfig.authorPubkeys.includes(session.user.pubkey)) {
      const purchasedVideo = session.user.purchased?.find(purchase => purchase?.resource?.videoId === videoKey)
      // first check if it is individual video
      if (!purchasedVideo) {
        // next we have to check if it is in a course the user has purchased
        const allPurchasedCourses = session?.user?.purchased?.filter(purchase => purchase?.courseId) || []
        
        const allPurchasedLessons = await Promise.all(
          allPurchasedCourses.map(course => getLessonsByCourseId(course.courseId))
        ).then(lessonsArrays => lessonsArrays.flat())

        if (!allPurchasedLessons.some(lesson => lesson?.resource?.videoId === videoKey)) {
          return res.status(403).json({ error: "Forbidden: You don't have access to this video" })
        }
      }
    }

    const command = new GetObjectCommand({
      Bucket: "plebdevs-bucket",
      Key: videoKey,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    })

    console.log("signedUrl", signedUrl)

    res.redirect(signedUrl)
  } catch (error) {
    console.error("Error in get-video-url handler:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}