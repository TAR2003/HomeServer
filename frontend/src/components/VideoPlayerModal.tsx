import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { X } from 'lucide-react';
import { MediaFile, mediaApi } from '@/lib/api';
import { Button } from './ui/Button';

interface VideoPlayerModalProps {
  file: MediaFile | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-6xl bg-background rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="aspect-video bg-black">
              <ReactPlayer
                url={mediaApi.getStreamUrl(file.filePath)}
                controls
                playing
                width="100%"
                height="100%"
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                    },
                  },
                }}
              />
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{file.fileName}</h2>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Type: {file.mimeType}</span>
                <span>Category: {file.category}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
