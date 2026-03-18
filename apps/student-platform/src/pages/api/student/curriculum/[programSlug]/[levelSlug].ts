import type { NextApiRequest, NextApiResponse } from "next";

import { respondMethodNotAllowed } from "@/lib/apiResponses";
import { requireStudentApiSession } from "@/lib/requireStudentApiSession";

const getCurriculumBaseUrl = () => {
  return (process.env.CURRICULUM_PLATFORM_URL ?? "").replace(/\/$/, "");
};

const getSecretHeader = () => {
  const secret = process.env.CURRICULUM_API_SHARED_SECRET;
  const headers: Record<string, string> = {};
  if (secret) {
    headers["x-curriculum-shared-secret"] = secret;
  }
  return headers;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return respondMethodNotAllowed(req, res, ["GET"]);
  }

  const session = await requireStudentApiSession(req, res);
  if (!session) {
    return;
  }

  const programSlug = req.query.programSlug;
  const levelSlug = req.query.levelSlug;
  if (typeof programSlug !== "string" || typeof levelSlug !== "string") {
    return res.status(400).json({ error: "Invalid curriculum route params" });
  }

  const baseUrl = getCurriculumBaseUrl();
  if (!baseUrl) {
    return res
      .status(500)
      .json({ error: "Missing CURRICULUM_PLATFORM_URL configuration" });
  }

  const upstreamUrl = `${baseUrl}/api/public/levels/${encodeURIComponent(programSlug)}/${encodeURIComponent(levelSlug)}`;

  const upstreamResponse = await fetch(upstreamUrl, {
    method: "GET",
    headers: {
      ...getSecretHeader(),
    },
  });

  const payload = await upstreamResponse.json();
  return res.status(upstreamResponse.status).json(payload);
}
