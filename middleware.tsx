import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  /^\/sign-in(\/.*)?$/,
  /^\/sign-up(\/.*)?$/,
  /^\/$/,
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/track$/,
  /^\/api\/clicks$/,
  /^\/api\/live-user$/,
  /^\/api\/events$/,
];

const isPublicRoute = (req: NextRequest) =>
  publicRoutes.some((route) => route.test(req.nextUrl.pathname));

export default function middleware(req: NextRequest) {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Optimistic check only (cookie presence). Real session validation happens
  // in the API routes and the dashboard layout via auth.api.getSession.
  if (!getSessionCookie(req)) {
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
