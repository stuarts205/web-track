import { db } from "@/configs/db";
import { pageViewTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
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
  const body = await req.json();
  const legacyClickTypes = [
    "click",
    "image_click",
    "menu_click",
    "button_click",
  ];

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

  let result;

  if (legacyClickTypes.includes(body?.type)) {
    return NextResponse.json(
      {
        message: "Click events moved to /api/clicks",
        type: body?.type,
        endpoint: "/api/clicks",
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

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
        countryCode: geoInfo.countryCode,
        region: geoInfo.region,
        refParams: body.refParams,
      })
      .returning();
  } else if (body?.type === "exit") {
    result = await db
      .update(pageViewTable)
      .set({
        exitTime: body.exitTime,
        totalActiveTime: body.totalActiveTime,
        exitUrl: body.exitUrl,
      })
      .where(eq(pageViewTable.visitorId, body.visitorId))
      .returning();
  } else {
    return NextResponse.json(
      { message: "Unsupported event type", type: body?.type },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json(
    { message: "Data received successfully", data: result },
    { headers: CORS_HEADERS },
  );
}
