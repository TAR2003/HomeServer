import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { getMediaById } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const media = await getMediaById(id);

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const filePath = media.path;
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get("range");

    // Support for range requests (video streaming)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = createReadStream(filePath, { start, end });
      
      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": getContentType(media.type),
        },
      });
    }

    // Full file response
    const stream = createReadStream(filePath);
    
    return new NextResponse(stream as any, {
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": getContentType(media.type),
      },
    });
  } catch (error) {
    console.error("Streaming error:", error);
    return NextResponse.json(
      { error: "Failed to stream media" },
      { status: 500 }
    );
  }
}

function getContentType(mediaType: string): string {
  switch (mediaType) {
    case "video":
      return "video/mp4";
    case "image":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}
