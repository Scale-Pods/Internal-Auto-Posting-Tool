import { NextRequest, NextResponse } from "next/server";

// ── Figma file URL patterns ──────────────────────────────────────────────────
// https://www.figma.com/file/FILEKEY/...?node-id=0:1
// https://www.figma.com/design/FILEKEY/...?node-id=0-1
function parseFigmaUrl(url: string): { fileKey: string; nodeId: string | null } | null {
  try {
    const u   = new URL(url);
    // fileKey is the segment after /file/ or /design/
    const match = u.pathname.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const fileKey = match[1];
    // node-id can be 0:1 or 0-1 depending on URL style
    const nodeIdRaw = u.searchParams.get("node-id") ?? null;
    // Normalise separator to colon (API expects "0:1")
    const nodeId = nodeIdRaw ? nodeIdRaw.replace(/-/g, ":") : null;
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { figmaUrl } = await req.json();
    if (!figmaUrl) {
      return NextResponse.json({ error: "figmaUrl is required" }, { status: 400 });
    }

    const token = req.cookies.get("figma_access_token")?.value || process.env.FIGMA_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "No Figma access token found. Please connect your Figma account." }, { status: 401 });
    }

    const parsed = parseFigmaUrl(figmaUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid Figma URL. Must be a /file/... or /design/... URL." },
        { status: 400 }
      );
    }

    const { fileKey, nodeId } = parsed;

    // ── Step 1: Get file info (name, thumbnail) ──────────────────────────────
    const fileRes = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, {
      headers: { "X-Figma-Token": token },
    });

    if (!fileRes.ok) {
      const body = await fileRes.json().catch(() => ({}));
      if (fileRes.status === 403) {
        return NextResponse.json({
          error: "Access denied. Make sure your Figma token has access to this file, and the file is not in a private team you haven't joined.",
        }, { status: 403 });
      }
      return NextResponse.json({ error: body?.message ?? "Figma API error" }, { status: fileRes.status });
    }

    const fileData = await fileRes.json();
    const fileName: string = fileData.name ?? "Untitled";
    const thumbnail: string | null = fileData.thumbnailUrl ?? null;

    // ── Step 2: Export frame(s) as PNG ───────────────────────────────────────
    // If nodeId was provided, export that specific frame.
    // Otherwise, export all top-level frames from the first page.
    let exportIds: string[] = [];

    if (nodeId) {
      exportIds = [nodeId];
    } else {
      // Grab the first page's top-level frame IDs (max 6)
      const firstPage = fileData.document?.children?.[0];
      const frames    = (firstPage?.children ?? []) as any[];
      exportIds = frames.slice(0, 6).map((f: any) => f.id);
    }

    if (exportIds.length === 0) {
      return NextResponse.json({ error: "No frames found in this Figma file." }, { status: 404 });
    }

    const idsParam = exportIds.join(",");
    const imgRes = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(idsParam)}&format=png&scale=2`,
      { headers: { "X-Figma-Token": token } }
    );

    if (!imgRes.ok) {
      const body = await imgRes.json().catch(() => ({}));
      return NextResponse.json({ error: body?.message ?? "Failed to export images from Figma" }, { status: imgRes.status });
    }

    const imgData = await imgRes.json();
    const exportedUrls: string[] = Object.values(imgData.images ?? {}).filter(Boolean) as string[];

    if (exportedUrls.length === 0) {
      return NextResponse.json({ error: "Figma returned no image URLs. The file may be empty." }, { status: 404 });
    }

    return NextResponse.json({
      fileName,
      thumbnail,
      exportedUrls,  // PNG URLs — valid for ~30 days
      frameCount: exportedUrls.length,
    });

  } catch (err: any) {
    console.error("[figma-export]", err);
    return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
  }
}
