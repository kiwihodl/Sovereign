import { runMiddleware, corsMiddleware } from "@/utils/corsMiddleware";

export default async function handler(req, res) {
    // Run CORS middleware first
    await runMiddleware(req, res, corsMiddleware);
    
    // Redirect to your lightning address endpoint
    const { slug } = req.query;
    res.redirect(307, `/api/lightning-address/lnurlp/${slug}`);
}
