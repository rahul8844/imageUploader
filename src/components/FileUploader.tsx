import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Grid, type CellComponentProps } from 'react-window';

import MobileGalleryUploader from './MobileGalleryUploader';
import FileCard from './FileCard';
import DropZone from './DropZone';
import { UploadScheduler } from '../services/uploadScheduler';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../constants';
import type { UploadedFile } from '../types/files';
import type { FileUploaderProps } from '../types/uploader';
import './FileUploader.css';

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  onUpload,
  maxFiles = 500,
  autoUpload = true
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, activeCount: 0 });
  // const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200;
  // const columnCount = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
  // const rowCount = Math.ceil(sortedFiles.length / columnCount);
  // Initialize upload scheduler
  const uploadScheduler = useMemo(
    () =>
      new UploadScheduler({
        maxConcurrent: 10,
        onProgress: (taskId, progress) => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === taskId
                ? { ...f, uploadProgress: progress, uploadStatus: 'uploading' as const }
                : f
            )
          );
        },
        onSuccess: (taskId, url, publicId) => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === taskId
                ? {
                  ...f,
                  uploadProgress: 100,
                  uploadStatus: 'success' as const,
                  cloudinaryUrl: url,
                  cloudinaryPublicId: publicId
                }
                : f
            )
          );
          console.log('Upload successful:', url);
        },
        onError: (taskId, error) => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === taskId ? { ...f, uploadStatus: 'error' as const, error } : f
            )
          );
          console.error('Upload error:', error);
        },
        onQueueUpdate: (queueLength, activeCount) => {
          setQueueStatus({ queueLength, activeCount });
        }
      }),
    []
  );

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size exceeds 5MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
  };

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newErrors: string[] = [];
      const validFiles: UploadedFile[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);

        if (error) {
          newErrors.push(error);
        } else {
          const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const preview = URL.createObjectURL(file);
          validFiles.push({
            file,
            preview,
            id,
            uploadProgress: 0,
            uploadStatus: 'pending'
          });
        }
      });

      setErrors(newErrors);

      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles]);

        if (onFilesSelected) {
          onFilesSelected(validFiles.map((f) => f.file));
        }

        if (autoUpload) {
          uploadScheduler.addToQueue(
            validFiles.map((vf) => ({ id: vf.id, file: vf.file }))
          );
        }

        setTimeout(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        }, validFiles.length * 1500);
      }
    },
    [maxFiles, onFilesSelected, autoUpload, uploadScheduler]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      e.target.value = '';
    },
    [processFiles]
  );

  const retryUpload = (id: string) => {
    const file = uploadedFiles.find((f) => f.id === id);
    if (file && file.uploadStatus === 'error') {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, uploadStatus: 'pending' as const, uploadProgress: 0, error: undefined }
            : f
        )
      );
      uploadScheduler.addToQueue([{ id: file.id, file: file.file }]);
    }
  };

  const removeFile = async (id: string) => {
    const file = uploadedFiles.find((f) => f.id === id);

    if (file?.cloudinaryPublicId) {
      try {
        const { deleteFromCloudinary } = await import('../services/cloudinary');
        await deleteFromCloudinary(file.cloudinaryPublicId);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
      }
    }

    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAllFiles = () => {
    uploadedFiles.forEach((file) => {
      URL.revokeObjectURL(file.preview);
    });
    setUploadedFiles([]);
    setErrors([]);
  };

  const dismissError = (index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  const overallProgress =
    uploadedFiles.length > 0
      ? uploadedFiles.reduce((acc, file) => acc + (file.uploadProgress || 0), 0) / uploadedFiles.length
      : 0;

  const uploadingCount = uploadedFiles.filter((f) => f.uploadStatus === 'uploading').length;
  const successCount = uploadedFiles.filter((f) => f.uploadStatus === 'success').length;

  const sortedFiles = [...uploadedFiles].sort((a, b) => {
    const statusOrder = { error: 0, uploading: 1, pending: 2, success: 3 };
    const aOrder = statusOrder[a.uploadStatus || 'pending'];
    const bOrder = statusOrder[b.uploadStatus || 'pending'];
    return aOrder - bOrder;
  });

  return (
    <div className={`file-uploader-container ${uploadedFiles.length > 0 ? 'layout-split' : 'layout-centered'}`}>
      <div className="file-uploader-header">
        <h2>Image Upload</h2>
        <p className="file-uploader-subtitle">
          Upload images (JPG, PNG, GIF, WEBP) - Max 5MB per file
        </p>
      </div>

      {showSuccess && (
        <div className="success-notification">
          <span className="success-icon">✓</span>
          <span className="success-text">
            All files uploaded successfully! {successCount} of {uploadedFiles.length} files complete.
          </span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button
                className="error-dismiss"
                onClick={() => dismissError(index)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadingCount > 0 && (
        <div className="overall-progress-section">
          <div className="overall-progress-header">
            <span>Uploading {uploadingCount} file{uploadingCount > 1 ? 's' : ''}...</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="overall-progress-bar">
            <div
              className="overall-progress-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="uploader-content-wrapper">
        <DropZone
          onFileSelect={handleFileSelect}
          onFileDropped={processFiles}
          hasFiles={uploadedFiles.length > 0}
        />
        <MobileGalleryUploader onFileSelect={handleFileSelect} />

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files-section">
            <div className="uploaded-files-header">
              <h3>Uploaded Files ({uploadedFiles.length})</h3>
              <button className="clear-all-button" onClick={clearAllFiles} type="button">
                Clear All
              </button>
            </div>

            <div className="uploaded-files-grid">
              {uploadedFiles.map((uploadedFile) => (
                <FileCard key={uploadedFile.id} file={uploadedFile} onRemoveFile={removeFile} onRetryUpload={retryUpload} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
