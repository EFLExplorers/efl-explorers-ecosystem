import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from "@/lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      const bookmarks = await storage.getBookmarks(Number(userId));
      return res.status(200).json(bookmarks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
