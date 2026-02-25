import type { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcryptjs";
import { prisma } from "@repo/database";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, firstName, lastName, platform } = req.body ?? {};

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    (platform !== "student" && platform !== "teacher")
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password is too short" });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "10");
    const passwordHash = await hash(password, saltRounds);
    const name = `${firstName} ${lastName}`.trim();

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: platform,
        approved: platform === "student",
        subscriptionTier: "free",
        firstName,
        lastName,
        name,
      },
      select: { id: true, role: true, approved: true },
    });

    return res.status(201).json({
      id: user.id,
      role: user.role,
      approved: user.approved,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
}
