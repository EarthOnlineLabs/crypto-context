import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Keep the two states the user can act on; genericize everything else.
    const msg = /not confirmed/i.test(error.message)
      ? "Email not confirmed yet — check your inbox for the confirmation link."
      : /rate|too many/i.test(error.message)
        ? "Too many attempts. Please wait a moment and try again."
        : "Invalid email or password.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user: { id: data.user.id, email: data.user.email },
  });
}
