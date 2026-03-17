import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import { insertMessageSchema } from "@shared/schema";
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
      const messages = await storage.getMessages(teacherRecordUserId);
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertMessageSchema
        .omit({ senderId: true })
        .parse(req.body);
      const message = await storage.createMessage({
        ...validatedData,
        senderId: teacherRecordUserId,
      });
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid message data",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Failed to create message" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
