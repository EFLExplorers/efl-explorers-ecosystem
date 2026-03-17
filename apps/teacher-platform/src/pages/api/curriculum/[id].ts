import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import { insertCurriculumSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const parsedCurriculumId = parsePositiveIntQueryParam(
    req.query.id,
    "curriculum ID"
  );
  if (!parsedCurriculumId.ok) {
    return res.status(400).json({ message: parsedCurriculumId.message });
  }
  const curriculumId = parsedCurriculumId.value;

  if (req.method === 'GET') {
    try {
      const curriculumItem = await storage.getCurriculumItem(curriculumId);
      if (!curriculumItem) {
        return res.status(404).json({ message: "Curriculum item not found" });
      }
      return res.status(200).json(curriculumItem);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch curriculum item" });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const validatedData = insertCurriculumSchema.partial().parse(req.body);
      const updatedItem = await storage.updateCurriculumItem(curriculumId, validatedData);

      if (!updatedItem) {
        return res.status(404).json({ message: "Curriculum item not found" });
      }

      return res.status(200).json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid curriculum data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to update curriculum item" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await storage.deleteCurriculumItem(curriculumId);
      if (!deleted) {
        return res.status(404).json({ message: "Curriculum item not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete curriculum item" });
    }
  }

  return respondMethodNotAllowed(req, res, ['GET', 'PUT', 'PATCH', 'DELETE']);
}
