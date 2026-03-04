import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // For GET without userId, require userId query param or return empty
      const userId = req.query.userId ? Number(req.query.userId) : 1; // Default to 1 if not provided
      const tasks = await storage.getTasks(userId);
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch tasks" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      return res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid task data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create task" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
