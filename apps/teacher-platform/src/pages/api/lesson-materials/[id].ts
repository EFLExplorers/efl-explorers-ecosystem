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

  const { id: rawId } = req.query;
  if (typeof rawId !== "string") {
    return res.status(400).json({ message: "Invalid lesson material ID" });
  }

  if (req.method === 'DELETE') {
    const materialId = Number.parseInt(rawId, 10);
    if (Number.isNaN(materialId) || materialId <= 0) {
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
