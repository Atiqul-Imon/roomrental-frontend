'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Paperclip, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useToast } from '@/components/ui/ToastProvider';

interface AttachmentPreview {
  url: string;
  type: 'image' | 'file';
  name: string;
  file?: File;
}

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, attachments?: string[]) => void;
  onTyping?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export function MessageInput({
  onSendMessage,
  onTyping,
  onTypingStop,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const validateFile = (file: File, isImage: boolean): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }

    if (!isImage && !ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only PDF, DOC, DOCX, and TXT files are allowed';
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null, isImage: boolean) => {
    if (!files || files.length === 0) return;

    const newAttachments: AttachmentPreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file, isImage);

      if (error) {
        toast.error(error);
        continue;
      }

      if (isImage) {
        // Create preview for images
        const previewUrl = URL.createObjectURL(file);
        newAttachments.push({
          url: previewUrl,
          type: 'image',
          name: file.name,
          file,
        });
      } else {
        // For files, we'll upload immediately and show a placeholder
        newAttachments.push({
          url: '',
          type: 'file',
          name: file.name,
          file,
        });
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);

    // Upload files immediately
    await uploadAttachments(newAttachments);
  };

  const uploadAttachments = async (newAttachments: AttachmentPreview[]) => {
    setIsUploading(true);

    for (const attachment of newAttachments) {
      if (!attachment.file) continue;

      const attachmentId = `${Date.now()}-${Math.random()}`;
      setUploadingAttachments((prev) => [...prev, attachmentId]);

      try {
        const formData = new FormData();
        formData.append('image', attachment.file);

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          // Update attachment with uploaded URL
          setAttachments((prev) =>
            prev.map((att) =>
              att === attachment
                ? { ...att, url: response.data.data.url }
                : att
            )
          );
        } else {
          throw new Error('Upload failed');
        }
      } catch (error: any) {
        toast.error(`Failed to upload ${attachment.name}`);
        // Remove failed attachment
        setAttachments((prev) => prev.filter((att) => att !== attachment));
      } finally {
        setUploadingAttachments((prev) => prev.filter((id) => id !== attachmentId));
      }
    }

    setIsUploading(false);
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    // Revoke object URL if it's a preview
    if (attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Typing indicators
    if (!isTyping && onTyping) {
      setIsTyping(true);
      onTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && onTypingStop) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 1000);
  };

  const handleSend = () => {
    const hasContent = message.trim() || attachments.length > 0;
    const allAttachmentsUploaded = attachments.every((att) => att.url && !att.url.startsWith('blob:'));

    if (hasContent && !disabled && !isUploading && allAttachmentsUploaded) {
      const attachmentUrls = attachments
        .filter((att) => att.url && !att.url.startsWith('blob:'))
        .map((att) => att.url);

      const messageType = attachments.length > 0 && attachments[0].type === 'image' ? 'image' : 'text';
      const content = message.trim() || (attachments.length > 0 ? '📎' : '');

      onSendMessage(content, messageType, attachmentUrls);

      // Cleanup
      setMessage('');
      attachments.forEach((att) => {
        if (att.url.startsWith('blob:')) {
          URL.revokeObjectURL(att.url);
        }
      });
      setAttachments([]);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (isTyping && onTypingStop) {
        setIsTyping(false);
        onTypingStop();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } else if (isUploading) {
      toast.info('Please wait for files to finish uploading');
    } else if (!allAttachmentsUploaded) {
      toast.info('Please wait for all files to upload');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const canSend = (message.trim() || attachments.length > 0) && !isUploading && 
    attachments.every((att) => att.url && !att.url.startsWith('blob:'));

  return (
    <div className="border-t border-accent-200 bg-white shadow-lg">
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="p-2 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-300 bg-gray-100"
              >
                {attachment.type === 'image' ? (
                  attachment.url ? (
                    <Image
                      src={attachment.url}
                      alt={attachment.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-accent-500" />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <Paperclip className="w-6 h-6 text-gray-600" />
                    <span className="text-xs text-gray-600 truncate w-full text-center">
                      {attachment.name}
                    </span>
                  </div>
                )}
                {uploadingAttachments.length === 0 && (
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {uploadingAttachments.length > 0 && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* File upload buttons */}
          <div className="flex gap-1">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files, true)}
              disabled={disabled || isUploading}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload image"
              disabled={disabled || isUploading}
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files, false)}
              disabled={disabled || isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload file"
              disabled={disabled || isUploading}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isUploading}
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-400 resize-none max-h-32 overflow-y-auto disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend || disabled}
            className="px-5 py-2.5 bg-gradient-primary text-white rounded-xl hover:opacity-90 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100 flex items-center gap-2 font-semibold"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}


