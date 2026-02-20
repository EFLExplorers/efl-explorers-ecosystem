import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertLessonSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const lessons = await storage.getLessons();
      return res.status(200).json(lessons);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch lessons" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(validatedData);
      return res.status(201).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid lesson data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create lesson" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
