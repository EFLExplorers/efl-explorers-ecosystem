import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const students = await storage.getStudents();
      return res.status(200).json(students);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch students" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      return res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid student data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create student" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
