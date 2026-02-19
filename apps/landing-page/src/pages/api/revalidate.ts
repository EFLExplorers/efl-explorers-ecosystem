import { NextApiRequest, NextApiResponse } from "next";
import { requireApiKey } from "../../utils/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireApiKey(req, res)) {
    return;
  }

  try {
    // Revalidate all SSG/ISR pages that read database content.
    // Note: SSR pages (e.g. /contact) do not use ISR and don't need revalidation.
    const pagesToRevalidate = [
      "/",
      "/about",
      "/pricing",
      "/platforms/student",
      "/platforms/teacher",
    ];

    console.log("🔄 Revalidating pages...");

    for (const page of pagesToRevalidate) {
      try {
        await res.revalidate(page);
        console.log(`✅ Revalidated: ${page}`);
      } catch (error) {
        console.error(`❌ Failed to revalidate ${page}:`, error);
      }
    }

    return res.status(200).json({
      message: "Revalidation triggered successfully",
      revalidated: pagesToRevalidate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return res.status(500).json({
      error: "Revalidation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
