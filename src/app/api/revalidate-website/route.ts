import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const revalidateSecret = process.env.REVALIDATION_SECRET;

    if (!websiteUrl || !revalidateSecret) {
      return NextResponse.json({ error: "Missing config" }, { status: 500 });
    }

    const revalidateRes = await fetch(`${websiteUrl}/api/revalidate?secret=${revalidateSecret}&path=${slug ? `/blog/${slug}` : ""}`, {
      method: "POST"
    });
    const data = await revalidateRes.json();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
