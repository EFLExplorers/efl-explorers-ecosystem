import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import { insertLessonSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const parsedLessonId = parsePositiveIntQueryParam(req.query.id, "lesson ID");
  if (!parsedLessonId.ok) {
    return res.status(400).json({ message: parsedLessonId.message });
  }
  const lessonId = parsedLessonId.value;

  if (req.method === 'GET') {
    try {
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      return res.status(200).json(lesson);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch lesson" });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const validatedData = insertLessonSchema.partial().parse(req.body);
      const lesson = await storage.updateLesson(lessonId, validatedData);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      return res.status(200).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid lesson data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to update lesson" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await storage.deleteLesson(lessonId);
      if (!deleted) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete lesson" });
    }
  }

  return respondMethodNotAllowed(req, res, ['GET', 'PUT', 'PATCH', 'DELETE']);
}
