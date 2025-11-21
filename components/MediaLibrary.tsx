"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Grid3x3, List, Folder, Image, Film, Tv } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import MediaCard from "./MediaCard";
import UploadDialog from "./UploadDialog";
import MediaPlayer from "./MediaPlayer";

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "movie" | "series";
  path: string;
  thumbnail: string;
  size: number;
  uploadedAt: string;
  category: string;
}

export default function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    filterMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, mediaItems]);

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media");
      const data = await response.json();
      setMediaItems(data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = mediaItems;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const categories = [
    { id: "all", label: "All Media", icon: Grid3x3 },
    { id: "images-videos", label: "Images & Videos", icon: Image },
    { id: "movies", label: "Movies", icon: Film },
    { id: "series", label: "TV Series", icon: Tv },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <UploadDialog onUploadComplete={fetchMedia} />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </motion.div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-4"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                onClick={() => setSelectedMedia(item)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-64 flex-col items-center justify-center text-center"
        >
          <Folder className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No media found</h3>
          <p className="text-sm text-muted-foreground">
            Upload some files to get started
          </p>
        </motion.div>
      )}

      {/* Media Player Dialog */}
      {selectedMedia && (
        <MediaPlayer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}
