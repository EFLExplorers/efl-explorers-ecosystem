import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import { insertLessonMaterialSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertLessonMaterialSchema.parse(req.body);
      const lessonMaterial = await storage.createLessonMaterial(validatedData);
      return res.status(201).json(lessonMaterial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid lesson material data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create lesson material" });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
