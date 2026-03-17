import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const { lessonId: rawLessonId } = req.query;
  if (typeof rawLessonId !== "string") {
    return res.status(400).json({ message: "Invalid lesson ID" });
  }

  if (req.method === 'GET') {
    const lessonIdNum = Number.parseInt(rawLessonId, 10);
    if (Number.isNaN(lessonIdNum) || lessonIdNum <= 0) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    try {
      const materials = await storage.getLessonMaterials(lessonIdNum);
      return res.status(200).json(materials);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch lesson materials" });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
