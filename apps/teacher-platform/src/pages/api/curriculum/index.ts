import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertCurriculumSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const curriculum = await storage.getCurriculumItems();
      return res.status(200).json(curriculum);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch curriculum" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertCurriculumSchema.parse(req.body);
      const curriculum = await storage.createCurriculumItem(validatedData);
      return res.status(201).json(curriculum);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid curriculum data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create curriculum item" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
