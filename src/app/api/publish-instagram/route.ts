import { NextRequest, NextResponse } from "next/server";

const IG_API = "https://graph.facebook.com/v23.0";

// Resilient Fetch with Timout & Retries (Fixes Windows IPv6 / FB Drops)
async function fetchWithRetry(url: string, options: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      console.warn(`[IG Publish] Network request failed, retrying (${i + 1}/${maxRetries})...`, error.message);
      await new Promise(r => setTimeout(r, 3000 * (i + 1))); 
    }
  }
  throw new Error("Unreachable");
}

// Polling Helper
async function pollContainerProcessing(creationId: string, accessToken: string, mediaType: string, onProgress?: (attempt: number) => void) {
  console.log(`[IG Publish] Waiting for ${mediaType} processing on ${creationId}...`);
  let isFinished = false;
  let attempts = 0;
  
  while (!isFinished && attempts < 15) {
    if (onProgress) onProgress(attempts + 1);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log(`[IG Publish] Checking status for ${creationId} (Attempt ${attempts + 1}/15)...`);
    
    try {
      const statusRes = await fetchWithRetry(`${IG_API}/${creationId}?fields=status_code&access_token=${accessToken}`, {
          method: "GET"
      });
      const statusData = await statusRes.json();
      
      if (statusData.status_code === 'FINISHED') {
        isFinished = true;
        console.log(`[IG Publish] ${creationId} processing finished!`);
        return true; // Success
      } else if (statusData.status_code === 'ERROR') {
        console.error(`[IG Publish] ${creationId} processing error:`, statusData);
        throw new Error(`Instagram failed to process container: ${JSON.stringify(statusData)}`);
      }
    } catch (err) {
      console.log(`[IG Publish] Status check error on ${creationId}, retrying...`, err);
    }
    attempts++;
  }
  
  if (!isFinished) {
    throw new Error(`Processing timed out for container ${creationId} after 75 seconds`);
  }
  return true;
}

export async function POST(req: NextRequest) {
  const { media_url, caption, media_type = "IMAGE" } = await req.json();
  const accessToken = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_USER_ID || "17841475537428154";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(eventData: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
      }

      try {
        if (!accessToken || accessToken === "YOUR_INSTAGRAM_ACCESS_TOKEN_HERE") {
          throw new Error("Instagram access token not configured in .env.local");
        }
        if (!media_url) {
          throw new Error("media_url is required");
        }

        console.log(`[IG Publish] Starting ${media_type} publish job...`);
        send({ progress: 5, message: `Starting ${media_type} publish sequence...` });

        let finalCreationId = "";

        // ─── CAROUSEL FLOW ───
        if (media_type === "CAROUSEL") {
          const urls = media_url.split(",").map((u: string) => u.trim());
          if (urls.length < 2) {
             throw new Error("CAROUSEL requires at least 2 media URLs.");
          }

          send({ progress: 10, message: `Carousel detected with ${urls.length} items. Initiating stage 1 uploads...` });
          const childContainerIds: string[] = [];
          const progressPerItem = 70 / urls.length; // Uses 10% to 80%

          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const isVideo = url.toLowerCase().endsWith(".mp4");
            const baseProgress = 10 + (progressPerItem * i);
            send({ progress: baseProgress, message: `Stage 1: Pushing slide ${i + 1} of ${urls.length} to Facebook...` });
            
            const childPayload: any = {
               access_token: accessToken,
               is_carousel_item: true,
            };

            if (isVideo) {
               childPayload.media_type = "VIDEO";
               childPayload.video_url = url;
            } else {
               childPayload.image_url = url;
            }

            const childRes = await fetchWithRetry(`${IG_API}/${igUserId}/media`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(childPayload),
            });
            const childData = await childRes.json();
            
            if (!childRes.ok || childData.error) {
               throw new Error(`Failed to create carousel slide ${i+1}: ${JSON.stringify(childData.error || childData)}`);
            }

            const childId = childData.id;
            
            if (isVideo) {
               await pollContainerProcessing(childId, accessToken, "CAROUSEL_VIDEO", (attempt) => {
                  send({ progress: baseProgress, message: `Facebook is encoding video slide ${i + 1}/${urls.length} (Poll ${attempt}/15)...` });
               });
            } else {
               await new Promise(r => setTimeout(r, 2000));
            }

            childContainerIds.push(childId);
          }

          send({ progress: 80, message: `Stage 2: Assembling Master Carousel Container...` });
          
          const masterPayload = {
            access_token: accessToken,
            caption: caption || "",
            media_type: "CAROUSEL",
            children: childContainerIds
          };

          const masterRes = await fetchWithRetry(`${IG_API}/${igUserId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(masterPayload),
          });
          const masterData = await masterRes.json();

          if (!masterRes.ok || masterData.error) {
             throw new Error(`Failed to create Master Carousel Container: ${JSON.stringify(masterData.error || masterData)}`);
          }

          finalCreationId = masterData.id;
          
          const hasVideo = urls.some((u: string) => u.toLowerCase().endsWith(".mp4"));
          if (hasVideo) {
             send({ progress: 85, message: `Waiting for Facebook to finalize Master Carousel aggregation...` });
             await pollContainerProcessing(finalCreationId, accessToken, "MASTER_CAROUSEL", (attempt) => {
                send({ progress: 85, message: `Waiting for Facebook to finalize Master Carousel aggregation (Poll ${attempt}/15)...` });
             });
          } else {
             send({ progress: 85, message: `Connecting master container...` });
             await new Promise((resolve) => setTimeout(resolve, 5000));
          }
          
        } else {
          // ─── STANDARD FLOW (FEED / REELS / STORIES) ───
          send({ progress: 20, message: `Creating Meta Container...` });
          const isVideo = media_url?.toLowerCase().endsWith(".mp4");
          const bodyPayload: any = {
            access_token: accessToken,
            caption: caption || "",
          };

          if (media_type === "REELS") {
            bodyPayload.video_url = media_url;
            bodyPayload.media_type = "REELS";
          } else if (media_type === "STORIES") {
            bodyPayload.media_type = "STORIES";
            if (isVideo) {
              bodyPayload.video_url = media_url;
            } else {
              bodyPayload.image_url = media_url;
            }
          } else {
            bodyPayload.image_url = media_url;
          }

          const containerRes = await fetchWithRetry(`${IG_API}/${igUserId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
          });
          const containerData = await containerRes.json();

          if (!containerRes.ok || containerData.error) {
            throw new Error(`Failed to create Instagram media container: ${JSON.stringify(containerData.error || containerData)}`);
          }

          finalCreationId = containerData.id;
          if (!finalCreationId) {
            throw new Error(`No creation_id returned from Instagram API: ${JSON.stringify(containerData)}`);
          }

          if (media_type === "REELS" || (media_type === "STORIES" && isVideo)) {
             send({ progress: 50, message: `Facebook is heavily processing the video stream. Please be patient...` });
             await pollContainerProcessing(finalCreationId, accessToken, media_type, (attempt) => {
                send({ progress: 50, message: `Facebook is heavily processing the video stream (Poll ${attempt}/15)...` });
             });
          } else {
             send({ progress: 50, message: `Waiting briefly before publish...` });
             await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }

        // ─── STAGE 3: PUBLISH ───
        send({ progress: 95, message: `Stage 3: Sending final release command to Instagram!` });
        const publishRes = await fetchWithRetry(`${IG_API}/${igUserId}/media_publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: finalCreationId,
            access_token: accessToken,
          }),
        });

        const publishData = await publishRes.json();

        if (!publishRes.ok || publishData.error) {
          throw new Error(`Failed to publish Instagram post: ${JSON.stringify(publishData.error || publishData)}`);
        }

        const igPostId = publishData.id;
        send({
          success: true,
          progress: 100,
          message: "Publishing complete!",
          ig_post_id: igPostId,
          ig_post_url: `https://www.instagram.com/p/${igPostId}/`,
        });
        controller.close();

      } catch (err: any) {
        send({ error: true, details: { message: err.message } });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
