import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import { insertTaskSchema } from "@shared/schema";
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
  const { id: rawId } = req.query;
  if (typeof rawId !== "string") {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  const taskId = Number.parseInt(rawId, 10);
  if (Number.isNaN(taskId) || taskId <= 0) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  if (req.method === 'PATCH') {
    try {
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (existingTask.userId !== teacherRecordUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const validatedData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(taskId, validatedData);

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid task data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to update task" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (existingTask.userId !== teacherRecordUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const deleted = await storage.deleteTask(taskId);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete task" });
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
