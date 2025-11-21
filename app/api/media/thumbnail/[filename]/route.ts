import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const mediaRoot = process.env.MEDIA_ROOT || "/media";
    const thumbnailPath = path.join(mediaRoot, "thumbnails", filename);

    const stream = createReadStream(thumbnailPath);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Thumbnail error:", error);
    return NextResponse.json(
      { error: "Thumbnail not found" },
      { status: 404 }
    );
  }
}
