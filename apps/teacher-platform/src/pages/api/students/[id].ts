import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const parsedStudentId = parsePositiveIntQueryParam(req.query.id, "student ID");
  if (!parsedStudentId.ok) {
    return res.status(400).json({ message: parsedStudentId.message });
  }
  const studentId = parsedStudentId.value;

  if (req.method === 'GET') {
    try {
      const student = await storage.getStudent(studentId);
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
      const student = await storage.updateStudent(studentId, validatedData);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
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
      const deleted = await storage.deleteStudent(studentId);
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete student" });
    }
  }

  return respondMethodNotAllowed(req, res, ['GET', 'PUT', 'PATCH', 'DELETE']);
}
