import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ ok: false, error: "Missing videoId" }, { status: 400 });
  }

  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;
  const pullZone = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;

  if (!libraryId || !apiKey || !pullZone) {
    return NextResponse.json(
      { ok: false, error: "Bunny is not fully configured on the server." },
      { status: 500 }
    );
  }

  try {
    const infoRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        headers: { AccessKey: apiKey },
        cache: "no-store",
      }
    );

    if (!infoRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Could not fetch video info from Bunny." },
        { status: 500 }
      );
    }

    const info = await infoRes.json();
    const resolutions: string[] = (info.availableResolutions || "")
      .split(",")
      .map((r: string) => r.trim())
      .filter(Boolean);

    const priority = ["1080p", "720p", "480p", "360p", "240p"];
    const chosen =
      priority.find((res) => resolutions.includes(res)) || resolutions[0];

    if (!chosen) {
      return NextResponse.json(
        { ok: false, error: "No downloadable version is available for this video yet." },
        { status: 404 }
      );
    }

    const downloadUrl = `https://${pullZone}.b-cdn.net/${videoId}/play_${chosen}.mp4`;

    return NextResponse.json({ ok: true, url: downloadUrl });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
