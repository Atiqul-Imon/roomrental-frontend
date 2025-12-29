/**
 * File Upload Component
 * Phase 2: User Experience - Forms & Input
 * 
 * Provides drag & drop, preview, and progress indicators
 */

'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label, BodySmall } from './Typography';
import { Button } from './Button';

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  onUpload: (files: File[]) => Promise<string[]>; // Returns array of URLs
  onRemove?: (url: string) => void;
  existingFiles?: string[];
  className?: string;
  helperText?: string;
  error?: string;
}

export function FileUpload({
  label,
  accept = 'image/*',
  multiple = true,
  maxFiles = 10,
  maxSize = 5,
  onUpload,
  onRemove,
  existingFiles = [],
  className,
  helperText,
  error,
}: FileUploadProps) {
  const [files, setFiles] = useState<string[]>(existingFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return 'Invalid file type';
    }
    return null;
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await processFiles(selectedFiles);
  };

  const processFiles = async (newFiles: File[]) => {
    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Check max files limit
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Upload files
    setUploading(true);
    try {
      const urls = await onUpload(validFiles);
      setFiles([...files, ...urls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleRemove = async (url: string, index: number) => {
    if (onRemove) {
      await onRemove(url);
    }
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-2">
          <Label>{label}</Label>
          {helperText && (
            <BodySmall className="text-grey-500 mt-1">{helperText}</BodySmall>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-accent-500 bg-accent-50'
            : error
            ? 'border-error-300 bg-error-50'
            : 'border-grey-300 bg-grey-50 hover:border-accent-400 hover:bg-accent-50/50',
          uploading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-600 animate-spin" />
            <BodySmall className="text-grey-600">Uploading...</BodySmall>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-grey-400 mx-auto mb-4" />
            <div className="mb-4">
              <p className="text-grey-700 font-medium mb-1">
                Drag & drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent-600 hover:text-accent-700 underline"
                >
                  browse
                </button>
              </p>
              <BodySmall className="text-grey-500">
                {accept.includes('image') ? 'Images' : 'Files'} up to {maxSize}MB
                {multiple && ` (max ${maxFiles} files)`}
              </BodySmall>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
          </>
        )}
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-grey-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url, index)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-medium"
                aria-label="Remove image"
              >
                <X className="w-4 h-4 text-grey-700" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <BodySmall className="text-error-600 mt-2 flex items-center gap-1">
          {error}
        </BodySmall>
      )}
    </div>
  );
}

