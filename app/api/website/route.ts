import { db } from "@/configs/db";
import { websiteTable } from "@/configs/schema";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { websiteId, domain, timezone, enableLocalhostTracking } =
    await req.json();
  const user = await currentUser();

  const existingDomain = await db
    .select()
    .from(websiteTable)
    .where(
      and(
        eq(websiteTable?.domain, domain),
        eq(
          websiteTable?.userEmail,
          user?.primaryEmailAddress?.emailAddress as string,
        ),
      ),
    );

  if (existingDomain.length > 0) {
    return NextResponse.json(
      { error: "Domain already exists", data: existingDomain[0] },
    );
  }

  const result = await db
    .insert(websiteTable)
    .values({
      websiteId,
      domain,
      timezone,
      enableLocalhostTracking,
      userEmail: user?.primaryEmailAddress?.emailAddress as string,
    })
    .returning();

  return NextResponse.json(result, { status: 200 });
}

export async function GET(req: NextRequest) {
  const user = await currentUser();

  const result = await db
    .select()
    .from(websiteTable)
    .where(
      eq(
        websiteTable?.userEmail,
        user?.primaryEmailAddress?.emailAddress as string,
      ),
    )
    .orderBy(desc(websiteTable?.id));

  return NextResponse.json(result, { status: 200 });
}
