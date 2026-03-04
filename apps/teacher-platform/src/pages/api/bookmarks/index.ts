import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertBookmarkSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // For GET without userId, return empty array or require userId query param
      const userId = req.query.userId ? Number(req.query.userId) : 1; // Default to 1 if not provided
      const bookmarks = await storage.getBookmarks(userId);
      return res.status(200).json(bookmarks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(validatedData);
      return res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid bookmark data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create bookmark" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
