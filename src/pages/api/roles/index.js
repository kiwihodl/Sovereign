import { createRole } from "@/db/models/roleModels";

export default async function handler(req, res) {
  if (req.method === "POST") {
    if (!req.body || !req.body.userId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      const roleData = {
        userId: req.body.userId,
        admin: req.body.admin || false,
        subscribed: req.body.subscribed || false,
        // Add other fields as needed
      };

      const role = await createRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ error: "Error creating role" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}