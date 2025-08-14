import React, { useState } from 'react';
import { uploadImage } from '../lib/api';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, publicId: string) => void;
  currentImage?: string;
  className?: string;
}

export default function ImageUpload({ onImageUpload, currentImage, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onImageUpload(result.imageUrl, result.publicId);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <label className="block text-sm font-medium text-gray-700">
          Event Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="Current event image" 
            className="w-32 h-24 object-cover rounded-lg border"
          />
          <div className="text-xs text-gray-500 mt-1">
            Current image
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="text-sm text-blue-600">
          {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
        </div>
      )}
    </div>
  );
}
