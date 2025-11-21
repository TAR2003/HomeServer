import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
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

    const stream = createReadStream(media.path);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${media.name}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download media" },
      { status: 500 }
    );
  }
}
