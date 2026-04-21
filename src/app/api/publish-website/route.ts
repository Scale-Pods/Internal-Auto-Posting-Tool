import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use the anon/publishable key — no service_role needed
// The INSERT RLS policy "Allow insert from API" handles security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      excerpt,
      body: articleBody,
      hero_image,
      category,
      tags,
      cta_label,
      cta_url,
      deliverable_id,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!hero_image) {
      return NextResponse.json(
        { error: "Hero image is required" },
        { status: 400 }
      );
    }

    // Generate slug, ensure uniqueness with timestamp suffix
    const baseSlug = generateSlug(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Insert into website_content
    const { data, error } = await supabase
      .from("website_content")
      .insert({
        slug,
        title,
        excerpt: excerpt || title.slice(0, 150),
        body: articleBody || "",
        hero_image,
        category: category || "insights",
        tags: tags || [],
        cta_label: cta_label || "Learn More",
        cta_url: cta_url || "https://scalepods.co/contact",
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Website Publish] Supabase insert error:", error);
      return NextResponse.json(
        { 
          error: "Failed to publish to website", 
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Optional: Also mark the deliverable as Published
    if (deliverable_id) {
      await supabase
        .from("content_deliverables")
        .update({ status: "Published" })
        .eq("id", deliverable_id);
    }

    // ── NEW: Trigger Revalidation ──
    try {
      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
      const revalidateSecret = process.env.REVALIDATION_SECRET;
      
      if (websiteUrl && revalidateSecret) {
        console.log(`[Website Publish] Triggering revalidation for ${data.slug}...`);
        const revalidateRes = await fetch(`${websiteUrl}/api/revalidate?secret=${revalidateSecret}&path=/blog/${data.slug}`, {
          method: "POST"
        });
        const revalidateData = await revalidateRes.json();
        
        if (!revalidateRes.ok || !revalidateData.revalidated) {
          throw new Error(revalidateData.message || "Revalidation handshake failed");
        }
        
        console.log("[Website Publish] Revalidation successful:", revalidateData);
      }
    } catch (revalidateErr: any) {
      console.error("[Website Publish] Revalidation failed:", revalidateErr.message);
      // We don't fail the whole database insert, but we return the revalidation warning
      return NextResponse.json({
        success: true,
        slug: data.slug,
        revalidation_warning: `Post saved, but cache refresh lagged: ${revalidateErr.message}`,
        url: `https://scalepods-replication.vercel.app/blog/${data.slug}`,
      });
    }

    console.log("[Website Publish] Success:", data.slug);

    return NextResponse.json({
      success: true,
      slug: data.slug,
      content_id: data.id,
      url: `https://scalepods.co/social-feed/${data.slug}`,
    });
  } catch (err: any) {
    console.error("[Website Publish] Unexpected error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
