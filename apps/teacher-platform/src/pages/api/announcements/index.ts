import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const announcements = await storage.getAnnouncements();
      return res.status(200).json(announcements);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch announcements" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      return res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid announcement data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create announcement" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
