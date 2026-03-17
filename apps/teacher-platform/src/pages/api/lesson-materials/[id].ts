import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const parsedLessonMaterialId = parsePositiveIntQueryParam(
    req.query.id,
    "lesson material ID"
  );
  if (!parsedLessonMaterialId.ok) {
    return res.status(400).json({ message: parsedLessonMaterialId.message });
  }

  if (req.method === 'DELETE') {
    const materialId = parsedLessonMaterialId.value;

    try {
      const deleted = await storage.deleteLessonMaterial(materialId);
      if (!deleted) {
        return res.status(404).json({ message: "Lesson material not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete lesson material" });
    }
  }

  return respondMethodNotAllowed(req, res, ['DELETE']);
}
