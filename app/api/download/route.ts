import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");
  const title = req.nextUrl.searchParams.get("title") || "movie";

  if (!videoId) {
    return new Response("Missing videoId", { status: 400 });
  }

  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;

  if (!libraryId || !apiKey || !pullZone) {
    return new Response("Bunny is not fully configured on the server.", { status: 500 });
  }

  try {
    const infoRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      { headers: { AccessKey: apiKey }, cache: "no-store" }
    );

    if (!infoRes.ok) {
      return new Response("Could not fetch video info from Bunny.", { status: 500 });
    }

    const info = await infoRes.json();
    const resolutions: string[] = (info.availableResolutions || "")
      .split(",")
      .map((r: string) => r.trim())
      .filter(Boolean);

    const priority = ["1080p", "720p", "480p", "360p", "240p"];
    const chosen = priority.find((res) => resolutions.includes(res)) || resolutions[0];

    if (!chosen) {
      return new Response("No downloadable version is available for this video yet.", {
        status: 404,
      });
    }

    const sourceUrl = `https://${pullZone}.b-cdn.net/${videoId}/play_${chosen}.mp4`;
    const upstream = await fetch(sourceUrl);

    if (!upstream.ok || !upstream.body) {
      return new Response("Could not download the video file.", { status: 502 });
    }

    const safeTitle = title.replace(/[^a-z0-9\-_ ]/gi, "").trim() || "movie";

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${safeTitle}.mp4"`,
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length") as string }
          : {}),
      },
    });
  } catch (err: any) {
    return new Response(err.message || "Something went wrong.", { status: 500 });
  }
}
