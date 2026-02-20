import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const messageId = parseInt(id as string);
    if (isNaN(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    try {
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
