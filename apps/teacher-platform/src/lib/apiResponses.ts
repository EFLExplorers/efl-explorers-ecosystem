import type { NextApiRequest, NextApiResponse } from "next";

export const respondMethodNotAllowed = (
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
) => {
  res.setHeader("Allow", allowedMethods);
  return res
    .status(405)
    .json({ message: `Method ${req.method ?? "UNKNOWN"} Not Allowed` });
};

export const parsePositiveIntQueryParam = (
  value: string | string[] | undefined,
  label: string
) => {
  if (typeof value !== "string") {
    return { ok: false as const, message: `Invalid ${label}` };
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return { ok: false as const, message: `Invalid ${label}` };
  }

  return { ok: true as const, value: parsed };
};
