import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/designer?error=figma_auth_denied`, req.url));
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code provided" }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_FIGMA_CLIENT_ID;
  const clientSecret = process.env.FIGMA_CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/api/auth/figma/callback";

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Figma credentials not configured" }, { status: 500 });
  }

  try {
    // Exchange the authorization code for an access token
    const tokenRes = await fetch("https://www.figma.com/api/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Figma requires Basic Auth with Client ID and Secret for the token exchange
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
      },
      body: new URLSearchParams({
        redirect_uri: redirectUri,
        code: code,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.json().catch(() => ({}));
      console.error("Figma token exchange failed:", errorData);
      return NextResponse.redirect(new URL(`/dashboard/designer?error=figma_token_exchange_failed`, req.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // usually 90 days

    // Store the access token securely in an HTTP-only cookie
    cookies().set({
      name: "figma_access_token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn, 
      path: "/",
    });

    // Redirect back to the designer module with a success flag
    return NextResponse.redirect(new URL(`/dashboard/designer?figma_connected=true`, req.url));

  } catch (err) {
    console.error("Error during Figma OAuth callback:", err);
    return NextResponse.redirect(new URL(`/dashboard/designer?error=figma_auth_exception`, req.url));
  }
}
