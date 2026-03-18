import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { prisma } from "@/lib/db";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { insertMaterialSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const { teacherRecordUserId } = session;

  if (req.method === 'GET') {
    try {
      const materials = await prisma.material.findMany({
        where: { createdBy: teacherRecordUserId },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(materials);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch materials" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertMaterialSchema
        .omit({ createdBy: true })
        .parse(req.body);
      const material = await storage.createMaterial({
        ...validatedData,
        createdBy: teacherRecordUserId,
      });
      return res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid material data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create material" });
    }
  }

  return respondMethodNotAllowed(req, res, ['GET', 'POST']);
}
