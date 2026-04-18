import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, role, name } = await request.json();

    if (!email || !password || !role || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert into Supabase
    const { data, error } = await supabase
      .from("user_accounts")
      .insert([
        { 
          email: email.trim().toLowerCase(), 
          password_hash, 
          role, 
          name 
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Registration database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        email: data.email,
        role: data.role,
        name: data.name
      }
    });
  } catch (err: any) {
    console.error("Registration API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
