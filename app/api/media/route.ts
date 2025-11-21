import { NextResponse } from "next/server";
import { getAllMedia } from "@/lib/database";

export async function GET() {
  try {
    const mediaRecords = await getAllMedia();

    const media = mediaRecords.map((record) => ({
      id: record.id,
      name: record.name,
      type: record.type,
      path: record.path,
      thumbnail: record.thumbnail,
      size: record.size,
      uploadedAt: record.uploaded_at,
      category: record.category,
    }));

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
