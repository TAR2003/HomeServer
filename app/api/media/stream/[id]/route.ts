import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { getMediaById } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`[Stream] Requesting media ID: ${id}`);
    
    const media = await getMediaById(id);

    if (!media) {
      console.error(`[Stream] Media not found: ${id}`);
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const filePath = media.path;
    console.log(`[Stream] File path: ${filePath}`);
    
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get("range");
    const contentType = getContentType(media.type, filePath);

    console.log(`[Stream] File size: ${fileSize}, Content-Type: ${contentType}, Range: ${range}`);

    // Support for range requests (video streaming)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      console.log(`[Stream] Streaming range: ${start}-${end}/${fileSize} (${chunkSize} bytes)`);

      const stream = createReadStream(filePath, { start, end });
      
      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=0",
        },
      });
    }

    // Full file response
    console.log(`[Stream] Streaming full file`);
    const stream = createReadStream(filePath);
    
    return new NextResponse(stream as any, {
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Stream] Error:", error);
    return NextResponse.json(
      { error: "Failed to stream media" },
      { status: 500 }
    );
  }
}

function getContentType(mediaType: string, filePath?: string): string {
  // Try to detect from file extension if available
  if (filePath) {
    const ext = filePath.toLowerCase().split('.').pop();
    
    // Video formats
    if (ext === 'mp4') return 'video/mp4';
    if (ext === 'webm') return 'video/webm';
    if (ext === 'ogg' || ext === 'ogv') return 'video/ogg';
    if (ext === 'avi') return 'video/x-msvideo';
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'mkv') return 'video/x-matroska';
    
    // Image formats
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'svg') return 'image/svg+xml';
  }
  
  // Fallback to media type
  switch (mediaType) {
    case "video":
    case "movie":
    case "series":
      return "video/mp4";
    case "image":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}
