import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const student = await storage.getStudent(Number(id));
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      return res.status(200).json(student);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch student" });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(Number(id), validatedData);
      return res.status(200).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid student data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to update student" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await storage.deleteStudent(Number(id));
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete student" });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
