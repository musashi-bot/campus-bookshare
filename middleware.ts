import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/books/new");
  const isAdminPath = pathname.startsWith("/admin");

  const { response, user, supabase } = await updateSession(request);

  // If user is accessing protected path without session
  if ((isProtectedPath || isAdminPath) && !user) {
    // If Supabase is not configured yet (e.g. initial dev), allow previewing pages with a warning rather than infinite loop
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl.includes("placeholder.supabase.co") || supabaseUrl.includes("xyzcompany")) {
      return response;
    }

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If accessing admin path, verify role
  if (isAdminPath && user && supabase) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2)$).*)",
  ],
};

