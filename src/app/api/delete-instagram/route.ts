import { NextRequest, NextResponse } from "next/server";

const IG_API = "https://graph.facebook.com/v23.0";

export async function POST(req: NextRequest) {
  try {
    const { ig_post_id } = await req.json();
    const accessToken = process.env.IG_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({ error: "Access token missing" }, { status: 500 });
    }
    if (!ig_post_id) {
      return NextResponse.json({ error: "ig_post_id is required" }, { status: 400 });
    }

    console.log(`[IG Delete] Deleting media ${ig_post_id}`);
    const res = await fetch(`${IG_API}/${ig_post_id}?access_token=${accessToken}`, {
      method: "DELETE",
    });

    const data = await res.json();
    console.log("[IG Delete] Response:", data);

    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: "Failed to delete post from Instagram", details: data.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[IG Delete] Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
