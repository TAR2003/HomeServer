import { NextRequest, NextResponse } from "next/server";
import { getMediaById, deleteMediaRecord } from "@/lib/database";
import fs from "fs";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get media info from database
    const media = await getMediaById(id);

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    console.log(`[Delete] Deleting media ${id}: ${media.name}`);

    // Delete the actual file
    const filePath = media.path;

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Delete] File deleted: ${filePath}`);
      }
    } catch (fileError) {
      console.error(`[Delete] Error deleting file:`, fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete thumbnail if it exists
    const thumbnailPath = path.join(path.dirname(filePath), "thumbnails", `${media.id}.jpg`);
    try {
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
        console.log(`[Delete] Thumbnail deleted: ${thumbnailPath}`);
      }
    } catch (thumbError) {
      console.error(`[Delete] Error deleting thumbnail:`, thumbError);
    }

    // Delete from database
    await deleteMediaRecord(id);
    console.log(`[Delete] Database record deleted for media ${id}`);

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("[Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
