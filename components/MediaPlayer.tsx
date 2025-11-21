"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Trash2 } from "lucide-react";
import ReactPlayer from "react-player";
import { Button } from "./ui/button";
import type { MediaItem } from "./MediaLibrary";

interface MediaPlayerProps {
  media: MediaItem;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function MediaPlayer({ media, onClose, onDelete }: MediaPlayerProps) {
  const isVideo = media.type === "video" || media.type === "movie" || media.type === "series";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/media/download/${media.id}`;
    link.download = media.name;
    link.click();
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${media.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/media/delete/${media.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Media deleted successfully");
        onDelete?.(media.id);
        onClose();
      } else {
        throw new Error("Failed to delete media");
      }
    } catch (error) {
      alert("Failed to delete media");
      console.error("Delete error:", error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-6xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleDownload}
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleDelete}
              className="bg-black/50 backdrop-blur-sm hover:bg-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={onClose}
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-black">
            {isVideo ? (
              <video
                controls
                autoPlay
                className="w-full"
                style={{ aspectRatio: "16/9" }}
                controlsList="nodownload"
              >
                <source src={`/api/media/stream/${media.id}`} type="video/mp4" />
                <source src={`/api/media/stream/${media.id}`} type="video/webm" />
                <source src={`/api/media/stream/${media.id}`} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={`/api/media/stream/${media.id}`}
                alt={media.name}
                className="w-full"
              />
            )}
          </div>

          <div className="mt-4 text-white">
            <h2 className="text-2xl font-bold">{media.name}</h2>
            <p className="text-sm text-gray-400">
              {media.category} • {new Date(media.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
