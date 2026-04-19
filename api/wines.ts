import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../lib/db";
import { Wine } from "../lib/models/Wine";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { search } = req.query;
    const filter =
      search && String(search).trim().length >= 2
        ? { name: { $regex: String(search).trim(), $options: "i" } }
        : {};

    const wines = await Wine.find(filter)
      .select("wineId name region salePrice regularPrice")
      .limit(20)
      .lean();

    return res.status(200).json({ data: wines });
  } catch (error) {
    console.error("[wines] Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
