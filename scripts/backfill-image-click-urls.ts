import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { pageViewTable } from "@/configs/schema";

const normalizeImageUrl = (rawUrl: string, pageUrl?: string | null) => {
  if (!rawUrl) return "";

  try {
    const base = pageUrl || "https://example.com";
    const parsed = new URL(rawUrl, base);

    // Normalize Next.js optimizer URLs back to the original source URL.
    if (parsed.pathname === "/_next/image") {
      const original = parsed.searchParams.get("url");
      if (original) {
        try {
          return decodeURIComponent(original);
        } catch {
          return original;
        }
      }
    }

    return parsed.href;
  } catch {
    return rawUrl;
  }
};

async function main() {
  const rows = await db
    .select({
      id: pageViewTable.id,
      imageUrl: pageViewTable.exitUrl,
      pageUrl: pageViewTable.url,
    })
    .from(pageViewTable)
    .where(eq(pageViewTable.type, "image_click"));

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const current = row.imageUrl || "";
    if (!current) {
      skipped += 1;
      continue;
    }

    const normalized = normalizeImageUrl(current, row.pageUrl);
    if (!normalized || normalized === current) {
      skipped += 1;
      continue;
    }

    await db
      .update(pageViewTable)
      .set({ exitUrl: normalized })
      .where(
        and(
          eq(pageViewTable.id, row.id),
          eq(pageViewTable.type, "image_click"),
        ),
      );

    updated += 1;
  }

  console.log(`Processed ${rows.length} image_click rows.`);
  console.log(`Updated ${updated} rows.`);
  console.log(`Skipped ${skipped} rows.`);
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
