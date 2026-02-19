import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { createHash, randomBytes } from "crypto";
import { authOptions } from "./[...nextauth]";
import { prisma } from "@repo/database";

type SsoTokenResponse =
  | { token: string; redirectUrl: string; expiresAt: string }
  | { error: string };

const TOKEN_TTL_MINUTES = 5;

const isPlatform = (value: unknown): value is "student" | "teacher" =>
  value === "student" || value === "teacher";

const getPlatformBaseUrl = (platform: "student" | "teacher") =>
  platform === "teacher"
    ? process.env.NEXT_PUBLIC_TEACHER_URL
    : process.env.NEXT_PUBLIC_STUDENT_URL;

const buildRedirectUrl = (baseUrl: string, token: string) => {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  return `${normalizedBase}/sso?token=${encodeURIComponent(token)}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SsoTokenResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id || !session.user.role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { platform } = req.body ?? {};
  if (!isPlatform(platform)) {
    return res.status(400).json({ error: "Invalid platform" });
  }

  if (session.user.role !== platform) {
    return res.status(403).json({ error: "Role mismatch" });
  }

  const baseUrl = getPlatformBaseUrl(platform);
  if (!baseUrl) {
    return res
      .status(500)
      .json({ error: "Platform URL is not configured" });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.ssoToken.create({
    data: {
      userId: session.user.id,
      tokenHash,
      platform,
      expiresAt,
    },
  });

  return res.status(200).json({
    token,
    redirectUrl: buildRedirectUrl(baseUrl, token),
    expiresAt: expiresAt.toISOString(),
  });
}
