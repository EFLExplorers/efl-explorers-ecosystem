import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertLessonSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const lesson = await storage.getLesson(Number(id));
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
      const lesson = await storage.updateLesson(Number(id), validatedData);
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
      await storage.deleteLesson(Number(id));
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete lesson" });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
