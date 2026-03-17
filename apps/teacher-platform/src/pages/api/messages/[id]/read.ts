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

  const { teacherRecordUserId } = session;
  const { id: rawId } = req.query;
  if (typeof rawId !== "string") {
    return res.status(400).json({ message: "Invalid message ID" });
  }

  if (req.method === 'PATCH') {
    const messageId = Number.parseInt(rawId, 10);
    if (Number.isNaN(messageId) || messageId <= 0) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    try {
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (
        message.senderId !== teacherRecordUserId &&
        message.receiverId !== teacherRecordUserId
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedMessage = await storage.markMessageAsRead(messageId);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      return res.status(200).json(updatedMessage);
    } catch (error) {
      return res.status(500).json({ message: "Failed to mark message as read" });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
