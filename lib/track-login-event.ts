import { db } from "@/configs/db";
import {
  trackerEventsTable,
  trackerRulesTable,
  usersTable,
  websiteTable,
} from "@/configs/schema";
import { and, eq } from "drizzle-orm";

// Records a "user_login" tracker event for every website the user owns that
// has an enabled "user_login" rule. Called when Better Auth creates a session.
export async function trackLoginEvent(userId: string, sessionId: string) {
  const users = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const email = users[0]?.email;
  if (!email) return;

  const ownedWebsites = await db
    .select()
    .from(websiteTable)
    .where(eq(websiteTable.userEmail, email));

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

    if (matchingRule.length === 0) continue;

    await db.insert(trackerEventsTable).values({
      websiteId: website.websiteId,
      trackerRuleId: matchingRule[0].id,
      eventName: "user_login",
      userId,
      sessionId,
      source: "webhook",
      metaJson: JSON.stringify({
        authEventType: "session.created",
        createdBy: "better_auth",
      }),
      createdAt,
    });
  }
}
