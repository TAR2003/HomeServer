"use client";

import { motion } from "framer-motion";
import { Film, Image as ImageIcon, Download, Play, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { formatBytes, formatDate } from "@/lib/utils";
import type { MediaItem } from "./MediaLibrary";

interface MediaCardProps {
  item: MediaItem;
  viewMode: "grid" | "list";
  onClick: () => void;
  onDelete: (id: string) => void;
}

export default function MediaCard({ item, viewMode, onClick, onDelete }: MediaCardProps) {
  const isVideo = item.type === "video" || item.type === "movie" || item.type === "series";

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = `/api/media/download/${item.id}`;
    link.download = item.name;
    link.click();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        whileHover={{ scale: 1.01 }}
      >
        <Card className="cursor-pointer overflow-hidden" onClick={onClick}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={item.thumbnail}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatBytes(item.size)} • {formatDate(item.uploadedAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group cursor-pointer overflow-hidden" onClick={onClick}>
        <CardContent className="p-0">
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={item.thumbnail}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5">
              {isVideo ? (
                <Film className="h-4 w-4 text-white" />
              ) : (
                <ImageIcon className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
          <div className="p-4">
            <h3 className="truncate font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatBytes(item.size)}
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1">
                <Play className="mr-2 h-3 w-3" />
                Play
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
