import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@repo/database";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, password } = req.body ?? {};
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Reset token is required" });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password is too short" });
  }

  try {
    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: "Reset token is invalid or expired" });
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "10");
    const passwordHash = await hash(password, saltRounds);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Password reset failed" });
  }
}
