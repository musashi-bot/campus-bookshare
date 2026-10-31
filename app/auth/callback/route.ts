import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Sync profile entry if not existing
      const { user } = data;
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "Student",
        phone: user.user_metadata?.phone || null,
        college: user.user_metadata?.college || null,
        role: user.user_metadata?.role || "student",
        college_verified: Boolean(user.user_metadata?.college_verified),
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate%20user`);
}

