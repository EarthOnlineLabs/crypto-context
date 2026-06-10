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

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // Pass through actionable validation; genericize everything else so raw
    // backend errors (incl. account-existence wording) never reach the client.
    const msg = /password/i.test(error.message)
      ? error.message
      : /rate|too many/i.test(error.message)
        ? "Too many attempts. Please wait a moment and try again."
        : "Sign-up failed. Please check your details and try again.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
