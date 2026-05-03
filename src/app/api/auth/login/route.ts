import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Query the user from our database
    const { data: user, error } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !user) {
      console.error(`Login failed: User not found for email ${email}. Error:`, error?.message);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare the provided password with the hashed password in the DB
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    console.log(`Bcrypt comparison for ${email}: ${isValid ? "SUCCESS" : "FAILED"}`);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Return the user info (excluding the hash)
    return NextResponse.json({
      email: user.email,
      role: user.role,
      name: user.name
    });
  } catch (err: any) {
    console.error("Auth API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
