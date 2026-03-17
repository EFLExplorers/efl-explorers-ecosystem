import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { insertBookmarkSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const { teacherRecordUserId } = session;

  if (req.method === 'GET') {
    try {
      const bookmarks = await storage.getBookmarks(teacherRecordUserId);
      return res.status(200).json(bookmarks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertBookmarkSchema
        .omit({ userId: true })
        .parse(req.body);
      const bookmark = await storage.createBookmark({
        ...validatedData,
        userId: teacherRecordUserId,
      });
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

  return respondMethodNotAllowed(req, res, ['GET', 'POST']);
}
