import type { NextApiRequest, NextApiResponse } from "next";
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

  if (req.method !== "GET") {
    return respondMethodNotAllowed(req, res, ["GET"]);
  }

  const parsedUserId = parsePositiveIntQueryParam(req.query.userId, "user ID");
  if (!parsedUserId.ok) {
    return res.status(400).json({ message: parsedUserId.message });
  }

  if (parsedUserId.value !== session.teacherRecordUserId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const tasks = await storage.getTasks(session.teacherRecordUserId);
    return res.status(200).json(tasks);
  } catch {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
}
