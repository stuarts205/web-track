import { db } from "@/configs/db";
import { clicksTable } from "@/configs/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "*";

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.websiteId) {
      return NextResponse.json(
        { message: "websiteId is required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const normalizeImageUrl = (rawUrl: string, pageUrl?: string) => {
      if (!rawUrl) return "";

      try {
        const base = pageUrl || "https://example.com";
        const parsed = new URL(rawUrl, base);

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

    const inferElementType = (eventType: string) => {
      if (eventType === "image_click") return "image";
      if (eventType.startsWith("image_swipe")) return "image";
      if (eventType === "menu_click") return "menu";
      if (eventType === "button_click") return "button";
      return "link";
    };

    const eventType = body.type || body.eventType || "click";
    const elementType = body.elementType || inferElementType(eventType);

    const fallbackLabel =
      body.linkText ||
      body.imageLabel ||
      body.imageAlt ||
      body.elementId ||
      body.imageId ||
      "Untitled Click";

    const normalizedImageUrl = normalizeImageUrl(body.imageUrl, body.url);

    const result = await db
      .insert(clicksTable)
      .values({
        websiteId: body.websiteId,
        visitorId: body.visitorId,
        domain: body.domain || "",
        pageUrl: body.url || body.pageUrl,
        eventType,
        elementType,
        label: body.label || fallbackLabel,
        targetUrl:
          body.clickedUrl || body.targetUrl || normalizedImageUrl || "",
        elementId: body.elementId || body.imageId || "",
        elementClass: body.elementClass || body.imageClass || "",
        createdAt:
          Number(body.entryTime || body.createdAt) ||
          Math.floor(Date.now() / 1000),
      })
      .returning();

    return NextResponse.json(
      { message: "Click tracked", data: result },
      { headers: CORS_HEADERS },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to track click",
        error: error?.message || "Unknown error",
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const websiteId = searchParams.get("websiteId");
  const visitorId = searchParams.get("visitorId");
  const eventType = searchParams.get("eventType");
  const elementType = searchParams.get("elementType");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const rawLimit = Number(searchParams.get("limit") || 100);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 500)
    : 100;

  const fromUnix = from ? Number(from) : undefined;
  const toUnix = to ? Number(to) : undefined;

  const filters = [
    ...(websiteId ? [eq(clicksTable.websiteId, websiteId)] : []),
    ...(visitorId ? [eq(clicksTable.visitorId, visitorId)] : []),
    ...(eventType ? [eq(clicksTable.eventType, eventType)] : []),
    ...(elementType ? [eq(clicksTable.elementType, elementType)] : []),
    ...(Number.isFinite(fromUnix)
      ? [gte(clicksTable.createdAt, fromUnix!)]
      : []),
    ...(Number.isFinite(toUnix) ? [lte(clicksTable.createdAt, toUnix!)] : []),
  ];

  const clicks = await db
    .select()
    .from(clicksTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(clicksTable.createdAt))
    .limit(limit);

  return NextResponse.json(
    {
      count: clicks.length,
      filters: {
        websiteId,
        visitorId,
        eventType,
        elementType,
        from: Number.isFinite(fromUnix) ? fromUnix : null,
        to: Number.isFinite(toUnix) ? toUnix : null,
        limit,
      },
      data: clicks,
    },
    { headers: CORS_HEADERS },
  );
}
