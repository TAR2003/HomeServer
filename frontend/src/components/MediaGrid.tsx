import React from 'react';
import { motion } from 'framer-motion';
import { Download, Play, Image as ImageIcon, FileVideo } from 'lucide-react';
import { MediaFile, mediaApi } from '@/lib/api';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { formatFileSize, formatDate } from '@/lib/utils';

interface MediaGridProps {
  files: MediaFile[];
  onPlayVideo?: (file: MediaFile) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ files, onPlayVideo }) => {
  const handleDownload = (file: MediaFile) => {
    window.open(mediaApi.getDownloadUrl(file.filePath), '_blank');
  };

  const getThumbnail = (file: MediaFile) => {
    if (file.thumbnailPath) {
      return mediaApi.getThumbnailUrl(file.thumbnailPath);
    }
    return undefined;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {files.map((file, index) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-muted">
              {file.thumbnailPath ? (
                <img
                  src={getThumbnail(file)}
                  alt={file.fileName}
                  className="w-full h-full object-cover"
                />
              ) : file.mimeType.startsWith('image/') ? (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {file.mimeType.startsWith('video/') && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                  onClick={() => onPlayVideo && onPlayVideo(file)}
                >
                  <div className="bg-white/90 rounded-full p-4">
                    <Play className="h-8 w-8 text-black" fill="currentColor" />
                  </div>
                </motion.button>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-sm truncate mb-2" title={file.fileName}>
                {file.fileName}
              </h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Size: {formatFileSize(file.fileSize)}</p>
                <p>Type: {file.mimeType}</p>
                <p>Uploaded: {formatDate(file.uploadedAt)}</p>
              </div>

              <div className="mt-4 flex gap-2">
                {file.mimeType.startsWith('video/') ? (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onPlayVideo && onPlayVideo(file)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(mediaApi.getStreamUrl(file.filePath), '_blank')}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
