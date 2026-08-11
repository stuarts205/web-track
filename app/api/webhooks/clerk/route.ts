import { db } from "@/configs/db";
import {
  trackerEventsTable,
  trackerRulesTable,
  websiteTable,
} from "@/configs/schema";
import { and, eq } from "drizzle-orm";
import { clerkClient, verifyWebhook } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type !== "session.created") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const sessionId = evt.data.id;
    const userId = evt.data.user_id;

    if (!userId) {
      return NextResponse.json({ message: "Missing user_id" }, { status: 400 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { message: "User has no primary email" },
        { status: 200 },
      );
    }

    const ownedWebsites = await db
      .select()
      .from(websiteTable)
      .where(eq(websiteTable.userEmail, email));

    if (ownedWebsites.length === 0) {
      return NextResponse.json(
        { message: "No websites found for user" },
        { status: 200 },
      );
    }

    const createdAt = Math.floor(Date.now() / 1000);

    for (const website of ownedWebsites) {
      const matchingRule = await db
        .select()
        .from(trackerRulesTable)
        .where(
          and(
            eq(trackerRulesTable.websiteId, website.websiteId),
            eq(trackerRulesTable.eventName, "user_login"),
            eq(trackerRulesTable.enabled, true),
          ),
        )
        .limit(1);

      if (matchingRule.length === 0) {
        continue;
      }

      await db.insert(trackerEventsTable).values({
        websiteId: website.websiteId,
        trackerRuleId: matchingRule[0].id,
        eventName: "user_login",
        userId,
        sessionId,
        source: "webhook",
        metaJson: JSON.stringify({
          clerkEventType: evt.type,
          createdBy: "clerk_webhook",
        }),
        createdAt,
      });
    }

    return NextResponse.json(
      { message: "Login event tracked" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Webhook processing failed",
        error: error?.message || "Unknown error",
      },
      { status: 400 },
    );
  }
}
