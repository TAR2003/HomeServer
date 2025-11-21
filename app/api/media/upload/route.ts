import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  generateImageThumbnail,
  generateVideoThumbnail,
  ensureDirectory,
  getCategoryFromPath,
  getMediaType,
} from "@/lib/media-utils";
import { createMediaRecord } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "images-videos";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine paths
    const mediaRoot = process.env.MEDIA_ROOT || "/media";
    const categoryPath = path.join(mediaRoot, category);
    const thumbnailPath = path.join(mediaRoot, "thumbnails");

    await ensureDirectory(categoryPath);
    await ensureDirectory(thumbnailPath);

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(categoryPath, uniqueFilename);
    const thumbnailFilename = `${uuidv4()}.jpg`;
    const thumbnailFullPath = path.join(thumbnailPath, thumbnailFilename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate thumbnail
    const mediaType = getMediaType(file.type);
    try {
      if (mediaType === "image") {
        await generateImageThumbnail(filePath, thumbnailFullPath);
      } else if (mediaType === "video") {
        await generateVideoThumbnail(filePath, thumbnailFullPath);
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      // Use a default thumbnail path if generation fails
    }

    // Save to database
    const mediaRecord = await createMediaRecord({
      name: file.name,
      type: mediaType,
      path: filePath,
      thumbnail: `/api/media/thumbnail/${thumbnailFilename}`,
      size: file.size,
      category: getCategoryFromPath(filePath),
    });

    return NextResponse.json({
      success: true,
      media: {
        id: mediaRecord.id,
        name: mediaRecord.name,
        type: mediaRecord.type,
        thumbnail: mediaRecord.thumbnail,
        size: mediaRecord.size,
        uploadedAt: mediaRecord.uploaded_at,
        category: mediaRecord.category,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
