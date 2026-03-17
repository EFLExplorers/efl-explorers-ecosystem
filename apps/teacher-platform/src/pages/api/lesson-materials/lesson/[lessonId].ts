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

  const parsedLessonId = parsePositiveIntQueryParam(
    req.query.lessonId,
    "lesson ID"
  );
  if (!parsedLessonId.ok) {
    return res.status(400).json({ message: parsedLessonId.message });
  }

  if (req.method === 'GET') {
    const lessonIdNum = parsedLessonId.value;

    try {
      const materials = await storage.getLessonMaterials(lessonIdNum);
      return res.status(200).json(materials);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch lesson materials" });
    }
  }

  return respondMethodNotAllowed(req, res, ['GET']);
}
