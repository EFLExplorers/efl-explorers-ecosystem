import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lessonId } = req.query;

  if (req.method === 'GET') {
    const lessonIdNum = parseInt(lessonId as string);
    if (isNaN(lessonIdNum)) {
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
