import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";

const updateBookmarkSchema = z.object({
  starred: z.boolean().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const { teacherRecordUserId } = session;
  const parsedBookmarkId = parsePositiveIntQueryParam(req.query.id, "bookmark ID");
  if (!parsedBookmarkId.ok) {
    return res.status(400).json({ message: parsedBookmarkId.message });
  }
  const bookmarkId = parsedBookmarkId.value;

  const existingBookmark = await storage.getBookmark(bookmarkId);
  if (!existingBookmark) {
    return res.status(404).json({ message: "Bookmark not found" });
  }
  if (existingBookmark.userId !== teacherRecordUserId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.method === "PATCH") {
    try {
      const validatedData = updateBookmarkSchema.parse(req.body);
      const updatedBookmark = await storage.updateBookmark(bookmarkId, validatedData);
      if (!updatedBookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      return res.status(200).json(updatedBookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid bookmark update data",
          errors: error.errors,
        });
      }
      return res.status(500).json({ message: "Failed to update bookmark" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await storage.deleteBookmark(bookmarkId);
      if (!deleted) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      return res.status(204).end();
    } catch {
      return res.status(500).json({ message: "Failed to delete bookmark" });
    }
  }

  return respondMethodNotAllowed(req, res, ["PATCH", "DELETE"]);
}
