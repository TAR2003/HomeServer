import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { mediaApi } from '@/lib/api';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  category: string;
  onUploadComplete?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  message?: string;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ category, onUploadComplete }) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    for (const fileObj of newFiles) {
      try {
        await mediaApi.uploadFile(fileObj.file, category, (progress) => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.file === fileObj.file ? { ...f, progress } : f
            )
          );
        });

        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === fileObj.file
              ? { ...f, status: 'success' as const, progress: 100 }
              : f
          )
        );

        if (onUploadComplete) {
          onUploadComplete();
        }
      } catch (error) {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === fileObj.file
              ? { ...f, status: 'error' as const, message: 'Upload failed' }
              : f
          )
        );
      }
    }
  }, [category, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
    },
  });

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop the files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports images and videos
            </p>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {uploadingFiles.map((fileObj, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-4 bg-card rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate">
                      {fileObj.file.name}
                    </p>
                    {fileObj.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {fileObj.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {fileObj.status === 'uploading' && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${fileObj.progress}%` }}
                      />
                    </div>
                  )}
                  {fileObj.status === 'error' && (
                    <p className="text-sm text-red-500">{fileObj.message}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileObj.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
