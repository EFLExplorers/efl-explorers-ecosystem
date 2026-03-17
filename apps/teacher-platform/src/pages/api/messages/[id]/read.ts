import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import {
  parsePositiveIntQueryParam,
  respondMethodNotAllowed,
} from "@/lib/apiResponses";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  const { teacherRecordUserId } = session;
  const parsedMessageId = parsePositiveIntQueryParam(req.query.id, "message ID");
  if (!parsedMessageId.ok) {
    return res.status(400).json({ message: parsedMessageId.message });
  }

  if (req.method === 'PATCH') {
    const messageId = parsedMessageId.value;

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

  return respondMethodNotAllowed(req, res, ['PATCH']);
}
