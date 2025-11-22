import axios from 'axios';

const API_BASE_URL = '/api';

export interface MediaFile {
  id: number;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  thumbnailPath: string | null;
  category: string;
  uploadedAt: string;
  modifiedAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file: MediaFile | null;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mediaApi = {
  // Upload file
  uploadFile: async (file: File, category: string, onProgress?: (percentage: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });

    return response.data;
  },

  // Get all files
  getAllFiles: async (): Promise<MediaFile[]> => {
    const response = await api.get<MediaFile[]>('/files');
    return response.data;
  },

  // Get files by category
  getFilesByCategory: async (category: string): Promise<MediaFile[]> => {
    const response = await api.get<MediaFile[]>(`/files?category=${category}`);
    return response.data;
  },

  // Get file structure
  getFileStructure: async (): Promise<Record<string, MediaFile[]>> => {
    const response = await api.get<Record<string, MediaFile[]>>('/files/structure');
    return response.data;
  },

  // Search files
  searchFiles: async (keyword: string): Promise<MediaFile[]> => {
    const response = await api.get<MediaFile[]>(`/files/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  // Get download URL
  getDownloadUrl: (path: string): string => {
    return `${API_BASE_URL}/download?path=${encodeURIComponent(path)}`;
  },

  // Get stream URL
  getStreamUrl: (path: string): string => {
    return `${API_BASE_URL}/stream?path=${encodeURIComponent(path)}`;
  },

  // Get thumbnail URL
  getThumbnailUrl: (path: string): string => {
    return `${API_BASE_URL}/thumbnail?path=${encodeURIComponent(path)}`;
  },
};
