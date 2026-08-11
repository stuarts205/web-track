import { db } from "@/configs/db";
import { trackerRulesTable, websiteTable } from "@/configs/schema";
import { and, asc, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const ensureOwnership = async (websiteId: string, email: string) => {
  const website = await db
    .select()
    .from(websiteTable)
    .where(
      and(
        eq(websiteTable.websiteId, websiteId),
        eq(websiteTable.userEmail, email),
      ),
    )
    .limit(1);

  return website.length > 0;
};

export async function GET(req: NextRequest) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const websiteId = req.nextUrl.searchParams.get("websiteId")?.trim();
  if (!websiteId) {
    return NextResponse.json(
      { message: "websiteId is required" },
      { status: 400 },
    );
  }

  const isOwner = await ensureOwnership(websiteId, userEmail);
  if (!isOwner) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const rules = await db
    .select()
    .from(trackerRulesTable)
    .where(eq(trackerRulesTable.websiteId, websiteId))
    .orderBy(asc(trackerRulesTable.eventName));

  return NextResponse.json({ data: rules });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const websiteId = body?.websiteId?.toString().trim();
  const eventName = body?.eventName?.toString().trim();

  if (!websiteId || !eventName) {
    return NextResponse.json(
      { message: "websiteId and eventName are required" },
      { status: 400 },
    );
  }

  const isOwner = await ensureOwnership(websiteId, userEmail);
  if (!isOwner) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const existing = await db
    .select()
    .from(trackerRulesTable)
    .where(
      and(
        eq(trackerRulesTable.websiteId, websiteId),
        eq(trackerRulesTable.eventName, eventName),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { message: "Rule already exists", data: existing[0] },
      { status: 200 },
    );
  }

  const source = (body?.source || "manual").toString().trim();
  const filtersJson = body?.filtersJson ? body.filtersJson.toString() : null;
  const enabled = body?.enabled === false ? false : true;

  const inserted = await db
    .insert(trackerRulesTable)
    .values({
      websiteId,
      eventName,
      enabled,
      source,
      filtersJson,
      createdBy: userEmail,
      createdAt: Math.floor(Date.now() / 1000),
    })
    .returning();

  return NextResponse.json({ data: inserted[0] }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = Number(body?.id);
  const enabled = Boolean(body?.enabled);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(trackerRulesTable)
    .where(eq(trackerRulesTable.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ message: "Rule not found" }, { status: 404 });
  }

  const isOwner = await ensureOwnership(existing[0].websiteId, userEmail);
  if (!isOwner) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const updated = await db
    .update(trackerRulesTable)
    .set({ enabled })
    .where(eq(trackerRulesTable.id, id))
    .returning();

  return NextResponse.json({ data: updated[0] });
}
