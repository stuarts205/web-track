import { db } from "@/configs/db";
import { clicksTable, liveUserTable, pageViewTable } from "@/configs/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, websiteId, last_seen } = body;

    if (!visitorId || !websiteId || !last_seen) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parser = new UAParser(req.headers.get("user-agent") || "");
    const deviceInfo = parser.getDevice()?.model || "";
    const osInfo = parser.getOS()?.name || "";
    const browserInfo = parser.getBrowser()?.name || "";

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "71.71.22.54";

    let geoInfo: any = {};
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
      geoInfo = await geoRes.json();
    } catch {
      // Geolocation is optional for live pings.
    }

    const normalizedLastSeen = Number(last_seen);

    await db
      .insert(liveUserTable)
      .values({
        visitorId,
        websiteId,
        last_seen: Number.isFinite(normalizedLastSeen)
          ? normalizedLastSeen
          : Date.now(),
        city: geoInfo.city || "",
        region: geoInfo.regionName || "",
        country: geoInfo.country || "",
        countryCode: geoInfo.countryCode || "",
        lat: geoInfo.lat?.toString() || "",
        lng: geoInfo.lon?.toString() || "",
        device: deviceInfo,
        os: osInfo,
        browser: browserInfo,
      })
      .onConflictDoUpdate({
        target: liveUserTable.visitorId,
        set: {
          last_seen: Number.isFinite(normalizedLastSeen)
            ? normalizedLastSeen
            : Date.now(),
          city: geoInfo.city || "",
          region: geoInfo.regionName || "",
          country: geoInfo.country || "",
          countryCode: geoInfo.countryCode || "",
          lat: geoInfo.lat?.toString() || "",
          lng: geoInfo.lon?.toString() || "",
          device: deviceInfo,
          os: osInfo,
          browser: browserInfo,
        },
      });

    return NextResponse.json(
      { message: "Data received successfully" },
      { headers: CORS_HEADERS },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function GET(req: NextRequest) {
  const websiteId = req.nextUrl.searchParams.get("websiteId");
  const visitorId = req.nextUrl.searchParams.get("visitorId");
  const now = Date.now();

  if (websiteId && visitorId) {
    const visitor = await db
      .select()
      .from(liveUserTable)
      .where(
        and(
          eq(liveUserTable.websiteId, websiteId),
          eq(liveUserTable.visitorId, visitorId),
        ),
      );

    const activeTimeAgg = await db
      .select({
        totalActiveTime: sql<number>`COALESCE(SUM(${pageViewTable.totalActiveTime}), 0)`,
      })
      .from(pageViewTable)
      .where(
        and(
          eq(pageViewTable.websiteId, websiteId),
          eq(pageViewTable.visitorId, visitorId),
        ),
      );

    const clickedImages = await db
      .select({
        imageUrl: clicksTable.targetUrl,
        imageLabel: clicksTable.label,
        clickedAt: clicksTable.createdAt,
      })
      .from(clicksTable)
      .where(
        and(
          eq(clicksTable.websiteId, websiteId),
          eq(clicksTable.visitorId, visitorId),
          eq(clicksTable.elementType, "image"),
        ),
      )
      .orderBy(sql`${clicksTable.createdAt} DESC`);

    const liveUser = visitor[0];
    if (!liveUser) {
      return NextResponse.json(null);
    }

    const isLive = Number(liveUser.last_seen) > now - 30000;
    const totalActiveTime = Number(activeTimeAgg[0]?.totalActiveTime ?? 0);

    return NextResponse.json({
      ...liveUser,
      totalActiveTime,
      isLive,
      clickedImages,
    });
  }

  const activeUsers = await db
    .select()
    .from(liveUserTable)
    .where(
      and(
        gt(liveUserTable.last_seen, now - 30000),
        eq(liveUserTable.websiteId, websiteId as string),
      ),
    );

  return NextResponse.json(activeUsers);
}
