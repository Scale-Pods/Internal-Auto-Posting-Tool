import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_FIGMA_CLIENT_ID;
  
  // Use VERCEL_PROJECT_PRODUCTION_URL if available, else VERCEL_URL, else localhost
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  const redirectUri = `${baseUrl}/api/auth/figma/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: "Figma Client ID not configured" }, { status: 500 });
  }

  // A random string to prevent CSRF
  const state = Math.random().toString(36).substring(7);

  const figmaAuthUrl = new URL("https://www.figma.com/oauth");
  figmaAuthUrl.searchParams.set("client_id", clientId);
  figmaAuthUrl.searchParams.set("redirect_uri", redirectUri);
  figmaAuthUrl.searchParams.set("scope", "files:read");
  figmaAuthUrl.searchParams.set("state", state);
  figmaAuthUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(figmaAuthUrl.toString());
}
