import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { prisma } from "@repo/database";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      return res.status(200).json({ ok: true });
    }

    const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
    const resetUrl = baseUrl
      ? `${baseUrl}/Auth/reset-password?token=${rawToken}`
      : null;

    if (process.env.NODE_ENV !== "production" && resetUrl) {
      console.log("Password reset URL:", resetUrl);
      return res.status(200).json({ ok: true, resetUrl });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Password reset request failed" });
  }
}
