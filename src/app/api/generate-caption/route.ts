import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const n8nUrl = process.env.NEXT_PUBLIC_N8N_AI_WEBHOOK;
    if (!n8nUrl) {
      return NextResponse.json({ error: "AI webhook URL not configured" }, { status: 500 });
    }

    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[AI Caption] n8n error:", text);
      return NextResponse.json({ error: `n8n returned ${res.status}: ${text}` }, { status: res.status });
    }

    const rawText = await res.text();
    console.log("[AI Caption] Raw n8n response:", rawText);

    if (!rawText || rawText.trim() === "" || rawText.trim() === '""') {
      return NextResponse.json(
        { error: "n8n returned an empty response. Check the OpenAI node output in n8n Executions." },
        { status: 500 }
      );
    }

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      // If it's plain text from AI, wrap it
      return NextResponse.json({ caption: rawText, hashtags: "" });
    }

    // n8n may return an array when using "All Incoming Items"
    if (Array.isArray(data)) {
      data = data[0];
    }

    // Langchain Agent wraps output in { output: { caption, hashtags } }
    if (data.output) {
      data = data.output;
    }

    // Also handle deeply nested json string inside output
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch { /* use as-is */ }
    }

    // Extract caption from various possible OpenAI output structures:
    // Structure 1: { message: { content: "..." } }
    // Structure 2: { choices: [{ message: { content: "..." } }] }
    // Structure 3: { text: "..." }
    // Structure 4: { caption: "...", hashtags: "..." } (already formatted)
    // Structure 5: { content: "..." }

    let captionText = "";
    let hashtagsText = "";

    if (data.caption) {
      // Already in our expected format
      captionText = data.caption;
      hashtagsText = data.hashtags || "";
    } else if (data.message?.content) {
      captionText = data.message.content;
    } else if (data.choices?.[0]?.message?.content) {
      captionText = data.choices[0].message.content;
    } else if (data.text) {
      captionText = data.text;
    } else if (data.content) {
      captionText = data.content;
    } else if (typeof data === "string") {
      captionText = data;
    } else {
      // Last resort: stringify it so we can see what n8n actually sent
      console.error("[AI Caption] Unknown structure:", JSON.stringify(data));
      captionText = JSON.stringify(data);
    }

    // If the AI returned JSON inside the text, try to parse it
    if (captionText.startsWith("{")) {
      try {
        const parsed = JSON.parse(captionText);
        if (parsed.caption) captionText = parsed.caption;
        if (parsed.hashtags) hashtagsText = parsed.hashtags;
      } catch {
        // Not JSON, just use it as-is
      }
    }

    return NextResponse.json({ caption: captionText, hashtags: hashtagsText });
    
  } catch (err: any) {
    console.error("[AI Caption] Proxy error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
