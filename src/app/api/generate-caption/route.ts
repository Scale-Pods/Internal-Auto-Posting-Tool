import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const n8nUrl = process.env.NEXT_PUBLIC_N8N_AI_WEBHOOK;
    if (!n8nUrl) {
      return NextResponse.json({ error: "AI webhook URL not configured in environment variables." }, { status: 500 });
    }

    // Set a timeout for the n8n request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      console.error("[AI Caption] n8n error:", text);
      return NextResponse.json({ 
        error: `n8n automation returned an error (${res.status}).`,
        details: text 
      }, { status: res.status });
    }

    const rawText = await res.text();
    console.log("[AI Caption] Raw n8n response:", rawText);

    if (!rawText || rawText.trim() === "" || rawText.trim() === "[]" || rawText.trim() === '""') {
       return NextResponse.json({ 
         error: "AI returned an empty response.",
         details: "The n8n workflow finished but provided no data. Please check your n8n OpenAI node and Webhook Response settings."
       }, { status: 500 });
    }

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      // If NOT JSON (raw string), check if it's potentially useful text
      if (rawText.length > 5) {
        return NextResponse.json({ caption: rawText, hashtags: "" });
      }
      return NextResponse.json({ error: "Received malformed data from AI." }, { status: 500 });
    }

    // Handle n8n wrapping in [ { ... } ]
    if (Array.isArray(data)) {
      if (data.length === 0 || (data.length === 1 && Object.keys(data[0]).length === 0)) {
        return NextResponse.json({ 
          error: "AI returned an empty object.", 
          details: "Structure received: [ {} ]. Ensure n8n Respond to Webhook node is returning the LangChain output." 
        }, { status: 500 });
      }
      data = data[0];
    }

    // Handle Langchain Agent wrapping
    if (data.output) {
      data = data.output;
    }

    // If data is still a string (likely nested JSON in string), try parsing again
    if (typeof data === "string" && (data.startsWith("{") || data.startsWith("["))) {
      try { data = JSON.parse(data); } catch { /* ignore */ }
    }

    let captionText = "";
    let hashtagsText = "";

    // Exhaustive search for caption in common AI/n8n response structures
    if (data.caption) {
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
    } else if (typeof data === "string" && data.length > 0) {
      captionText = data;
    }

    // Double-check if the AI returned a JSON string inside the captionText field
    if (captionText.trim().startsWith("{")) {
       try {
         const inner = JSON.parse(captionText);
         if (inner.caption) captionText = inner.caption;
         if (inner.hashtags) hashtagsText = inner.hashtags;
       } catch { /* not json */ }
    }

    // Final Validation: Ensure we don't return "{}" or similar noise
    if (!captionText || captionText.trim() === "{}" || captionText.trim() === "[]") {
        return NextResponse.json({ 
          error: "Failed to extract caption.",
          details: "The AI responded, but we couldn't find a valid caption in the output. Structure: " + JSON.stringify(data).slice(0, 100)
        }, { status: 500 });
    }

    return NextResponse.json({ 
      caption: captionText.trim(), 
      hashtags: hashtagsText.trim() 
    });
    
  } catch (err: any) {
    console.error("[AI Caption] Proxy error:", err.message);
    const isTimeout = err.name === 'AbortError';
    return NextResponse.json({ 
      error: isTimeout ? "Request timed out." : "Bridge error.",
      details: isTimeout ? "n8n took too long to respond (Limit: 30s)." : err.message
    }, { status: 500 });
  }
}
