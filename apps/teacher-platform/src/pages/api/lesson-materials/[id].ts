import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    const materialId = parseInt(id as string);
    if (isNaN(materialId)) {
      return res.status(400).json({ message: "Invalid lesson material ID" });
    }

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

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
