"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import ReactPlayer from "react-player";
import { Button } from "./ui/button";
import type { MediaItem } from "./MediaLibrary";

interface MediaPlayerProps {
  media: MediaItem;
  onClose: () => void;
}

export default function MediaPlayer({ media, onClose }: MediaPlayerProps) {
  const isVideo = media.type === "video" || media.type === "movie" || media.type === "series";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/media/download/${media.id}`;
    link.download = media.name;
    link.click();
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
              onClick={onClose}
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-black">
            {isVideo ? (
              <div className="relative">
                <video
                  controls
                  autoPlay
                  className="w-full"
                  style={{ aspectRatio: "16/9", maxHeight: "80vh" }}
                  controlsList="nodownload"
                  preload="metadata"
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    const video = e.target as HTMLVideoElement;
                    if (video.error) {
                      console.error("Video error code:", video.error.code, "message:", video.error.message);
                    }
                  }}
                >
                  <source src={`/api/media/stream/${media.id}`} />
                  Your browser does not support the video format.
                </video>
                <div className="absolute bottom-20 left-4 right-4 text-center text-sm text-white/80">
                  {media.name.toLowerCase().endsWith('.avi') && (
                    <p className="bg-black/50 px-4 py-2 rounded">
                      ⚠️ AVI format may have limited browser support. If the video doesn't play, try downloading it.
                    </p>
                  )}
                </div>
              </div>
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
