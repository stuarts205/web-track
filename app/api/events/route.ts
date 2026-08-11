import { db } from "@/configs/db";
import { trackerEventsTable, trackerRulesTable } from "@/configs/schema";
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

    const websiteId = body?.websiteId?.toString().trim();
    const eventName = body?.eventName?.toString().trim();

    if (!websiteId || !eventName) {
      return NextResponse.json(
        { message: "websiteId and eventName are required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const matchingRule = await db
      .select()
      .from(trackerRulesTable)
      .where(
        and(
          eq(trackerRulesTable.websiteId, websiteId),
          eq(trackerRulesTable.eventName, eventName),
          eq(trackerRulesTable.enabled, true),
        ),
      )
      .limit(1);

    if (matchingRule.length === 0) {
      return NextResponse.json(
        {
          message: "No enabled tracker rule for this event",
          websiteId,
          eventName,
        },
        { status: 202, headers: CORS_HEADERS },
      );
    }

    const source = (body?.source || matchingRule[0].source || "manual")
      .toString()
      .trim();

    const eventMeta = body?.meta
      ? JSON.stringify(body.meta).slice(0, 8192)
      : body?.metaJson?.toString().slice(0, 8192);

    const createdAtRaw = Number(body?.timestamp || body?.createdAt);
    const createdAt = Number.isFinite(createdAtRaw)
      ? Math.floor(createdAtRaw)
      : Math.floor(Date.now() / 1000);

    const inserted = await db
      .insert(trackerEventsTable)
      .values({
        websiteId,
        trackerRuleId: matchingRule[0].id,
        eventName,
        userId: body?.userId?.toString(),
        userEmailHash: body?.userEmailHash?.toString(),
        visitorId: body?.visitorId?.toString(),
        sessionId: body?.sessionId?.toString(),
        source,
        metaJson: eventMeta,
        createdAt,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Event tracked",
        data: inserted[0],
      },
      { headers: CORS_HEADERS },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failed to track event",
        error: error?.message || "Unknown error",
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const websiteId = searchParams.get("websiteId");
  const eventName = searchParams.get("eventName");
  const source = searchParams.get("source");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const rawLimit = Number(searchParams.get("limit") || 50);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 500)
    : 50;

  if (!websiteId) {
    return NextResponse.json(
      { message: "websiteId is required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const fromUnix = from ? Number(from) : undefined;
  const toUnix = to ? Number(to) : undefined;

  const filters = [
    eq(trackerEventsTable.websiteId, websiteId),
    ...(eventName ? [eq(trackerEventsTable.eventName, eventName)] : []),
    ...(source ? [eq(trackerEventsTable.source, source)] : []),
    ...(Number.isFinite(fromUnix)
      ? [gte(trackerEventsTable.createdAt, fromUnix!)]
      : []),
    ...(Number.isFinite(toUnix)
      ? [lte(trackerEventsTable.createdAt, toUnix!)]
      : []),
  ];

  const events = await db
    .select()
    .from(trackerEventsTable)
    .where(and(...filters))
    .orderBy(desc(trackerEventsTable.createdAt))
    .limit(limit);

  return NextResponse.json(
    {
      count: events.length,
      filters: {
        websiteId,
        eventName,
        source,
        from: Number.isFinite(fromUnix) ? fromUnix : null,
        to: Number.isFinite(toUnix) ? toUnix : null,
        limit,
      },
      data: events,
    },
    { headers: CORS_HEADERS },
  );
}
