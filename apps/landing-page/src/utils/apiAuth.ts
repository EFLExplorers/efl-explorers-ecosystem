import type { NextApiRequest, NextApiResponse } from "next";

const API_KEY_HEADER = "x-efl-api-key";

export const requireApiKey = (
  req: NextApiRequest,
  res: NextApiResponse
): boolean => {
  const configuredKey = process.env.EFL_API_KEY;

  if (!configuredKey) {
    res.status(500).json({ error: "API key is not configured" });
    return false;
  }

  const incoming =
    req.headers[API_KEY_HEADER] ?? req.headers[API_KEY_HEADER.toLowerCase()];
  const apiKey = Array.isArray(incoming) ? incoming[0] : incoming;

  if (!apiKey || apiKey !== configuredKey) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
};
