import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";

export async function generateImageThumbnail(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    await sharp(inputPath)
      .resize(400, 300, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    console.error("Error generating image thumbnail:", error);
    throw error;
  }
}

export async function generateVideoThumbnail(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [0], // First frame (0 seconds)
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: "400x300",
      })
      .on("end", () => {
        console.log("Video thumbnail generated successfully");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error generating video thumbnail:", err);
        reject(err);
      });
  });
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export function getCategoryFromPath(filePath: string): string {
  if (filePath.includes("/movies/") || filePath.includes("\\movies\\")) {
    return "movies";
  } else if (filePath.includes("/series/") || filePath.includes("\\series\\")) {
    return "series";
  } else {
    return "images-videos";
  }
}

export function getMediaType(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.startsWith("video/")) {
    return "video";
  }
  return "unknown";
}
