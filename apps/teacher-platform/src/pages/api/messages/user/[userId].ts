import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      const messages = await storage.getMessages(Number(userId));
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
