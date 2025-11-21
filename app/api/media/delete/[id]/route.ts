import { NextRequest, NextResponse } from "next/server";
import { unlinkSync } from "fs";
import { deleteMediaRecord, getMediaById } from "@/lib/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`[Delete] Requesting to delete media ID: ${id}`);

    const media = await getMediaById(id);

    if (!media) {
      console.error(`[Delete] Media not found: ${id}`);
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete the media file
    try {
      unlinkSync(media.path);
      console.log(`[Delete] Deleted file: ${media.path}`);
    } catch (fileError) {
      console.error(`[Delete] Error deleting file: ${media.path}`, fileError);
      // Continue even if file deletion fails
    }

    // Delete the thumbnail if it exists
    if (media.thumbnail) {
      try {
        const thumbnailPath = media.thumbnail.replace("/api/media/thumbnail/", "");
        const fullThumbnailPath = `/media/thumbnails/${thumbnailPath}`;
        unlinkSync(fullThumbnailPath);
        console.log(`[Delete] Deleted thumbnail: ${fullThumbnailPath}`);
      } catch (thumbError) {
        console.error(`[Delete] Error deleting thumbnail`, thumbError);
        // Continue even if thumbnail deletion fails
      }
    }

    // Delete from database
    await deleteMediaRecord(id);
    console.log(`[Delete] Deleted database record: ${id}`);

    return NextResponse.json({ 
      success: true,
      message: "Media deleted successfully" 
    });
  } catch (error) {
    console.error("[Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
