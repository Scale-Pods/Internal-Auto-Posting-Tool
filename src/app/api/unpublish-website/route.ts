import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "No slug provided" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log(`[Unpublish] Deleting post with slug: ${slug}`);

    // 1. Delete from website_content
    const { error: deleteError } = await supabase
      .from("website_content")
      .delete()
      .eq("slug", slug);

    if (deleteError) throw deleteError;

    // 2. Trigger Revalidation
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const revalidateSecret = process.env.REVALIDATION_SECRET;

    if (websiteUrl && revalidateSecret) {
      await fetch(`${websiteUrl}/api/revalidate?secret=${revalidateSecret}&path=/blog/${slug}`, {
        method: "POST"
      });
      // Also revalidate the index
      await fetch(`${websiteUrl}/api/revalidate?secret=${revalidateSecret}&path=/blog`, {
        method: "POST"
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Unpublish] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
