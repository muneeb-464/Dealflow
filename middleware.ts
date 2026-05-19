import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/about(.*)",
  "/blog(.*)",
  "/careers(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/api/webhooks(.*)",
  "/sso-callback(.*)",
  "/invite(.*)",
  "/access-denied(.*)",
  "/api/guest(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/login(.*)",
  "/register(.*)",
]);

const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/leads(.*)",
  "/clients(.*)",
  "/reminders(.*)",
  "/revenue(.*)",
  "/analytics(.*)",
  "/team(.*)",
  "/settings(.*)",
  "/workspace(.*)",
  "/workspace-setup(.*)",
]);

// Routes a guest (invite_guest) can access — everything else → access-denied
const isGuestAllowedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/leads(.*)",
  "/reminders(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Logged-in user hits /login or /register → send to dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Check for guest session cookie
  const guestCookie = req.cookies.get("dealflow-guest")?.value;
  if (!userId && isDashboardRoute(req) && guestCookie) {
    if (isGuestAllowedRoute(req)) {
      return NextResponse.next();
    }
    // Guest hitting a blocked route → access-denied
    const segment = req.nextUrl.pathname.split("/").filter(Boolean)[0] ?? "";
    return NextResponse.redirect(
      new URL(`/access-denied?page=${segment}&role=invite_guest`, req.url)
    );
  }

  // Logged-out user (no guest cookie) hits dashboard → send to login
  if (!userId && isDashboardRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Public routes — allow through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Everything else protected
  await auth.protect({ unauthenticatedUrl: new URL("/login", req.url).toString() });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
