import { db } from "@/configs/db";
import { pageViewTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parser = new UAParser(req.headers.get("user-agent") || "");
  const deviceInfo = parser.getDevice()?.model;
  const osInfo = parser.getOS()?.name;
  const browserInfo = parser.getBrowser()?.name;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "69.27.10.190";

  const geoRes = await fetch(`http://ip-api.com/json/69.27.10.190`);
  const geoInfo = await geoRes.json();

  console.log("Body:", body);
  console.log("Device Info:", deviceInfo);
  console.log("OS Info:", osInfo);
  console.log("Browser Info:", browserInfo);
  console.log("IP Address:", ip);
  console.log("Geo Info:", geoInfo);

  let result;

  if (body?.type === "entry") {
    result = await db
      .insert(pageViewTable)
      .values({
        visitorId: body.visitorId,
        websiteId: body.websiteId,
        domain: body.domain,
        url: body.url,
        type: body.type,
        referrer: body.referrer,
        entryTime: body.entryTime,
        exitTime: body.exitTime,
        totalActiveTime: body.totalActiveTime,
        urlParams: body.urlParams,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        device: deviceInfo,
        os: osInfo,
        browser: browserInfo,
        ipAddress: ip || "",
        city: geoInfo.city,
        country: geoInfo.country,
        region: geoInfo.region,
        refParams: body.refParams,
      })
      .returning();
  } else {
    await db
      .update(pageViewTable)
      .set({
        exitTime: body.exitTime,
        totalActiveTime: body.totalActiveTime,
      })
      .where(eq(pageViewTable.visitorId, body.visitorId))
      .returning();
  }

  return NextResponse.json({ message: "Data received", data: result });
}
