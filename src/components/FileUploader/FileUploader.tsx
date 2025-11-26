import React, { useState, useCallback, useEffect, useContext, useRef, useMemo } from 'react';
import Loader from '../Loader';
import { FileDropContext } from '../FileUploaderContext/FileDropContextWrapper';
import { useUploadScheduler } from '../../hooks/useUploadScheduler';
import { validateFile } from '../../constants/utils';
import type { FileDropContextType } from '../../types/uploader';
import type { UploadedFile } from '../../types/files';
import type { ToastType } from '../../types/toast';
import './FileUploader.css';

const Toast = React.lazy(() => import('../Toast'));
const FileCard = React.lazy(() => import('./components/FileCard'));
const MobileGalleryUploader = React.lazy(() => import('./components/MobileGalleryUploader'));
const DropZone = React.lazy(() => import('./components/DropZone'));

const FileUploader: React.FC = () => {
  const { uploadedFiles, setUploadedFiles }: FileDropContextType = useContext(FileDropContext);
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean; isPersistent: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
    isPersistent: false
  });
  const { uploadScheduler } = useUploadScheduler();
  const containerRef = useRef<HTMLDivElement>(null);

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
        uploadScheduler.addToQueue(
          validFiles.map((vf) => ({ id: vf.id, file: vf.file }))
        );
      }
    },
    [uploadScheduler]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      e.target.value = '';
    },
    [processFiles]
  );

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

  const reuploadFile = (file: UploadedFile) => {
    uploadScheduler.addToQueue([{ id: file.id, file: file.file }]);
  };

  useEffect(() => {
    const handleOnline = () => {
      // Auto-retry failed uploads
      const failedFiles = uploadedFiles.filter(f => f.uploadStatus === 'error');
      if (failedFiles.length > 0) {
        setToast({
          message: `Connection restored. Retrying ${failedFiles.length} failed uploads...`,
          type: 'success',
          isVisible: true,
          isPersistent: false
        });
        failedFiles.forEach(file => {
          reuploadFile(file);
        });
      } else {
        setToast({
          message: 'Connection restored.',
          type: 'success',
          isVisible: true,
          isPersistent: false
        });
      }
    };

    const handleOffline = () => {
      setToast({
        message: 'You have been disconnected from the internet.',
        type: 'error',
        isVisible: true,
        isPersistent: true
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [uploadedFiles, reuploadFile]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const uploadContainer = document.getElementById("upload-container");
      if (uploadContainer) {
        uploadContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [uploadedFiles.length]);

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

  // console.log({ uploadingCount, successCount, overallProgress })

  const sortedFiles = [...uploadedFiles].sort((a, b) => {
    const statusOrder = { error: 0, uploading: 1, pending: 2, success: 3 };
    const aOrder = statusOrder[a.uploadStatus || 'pending'];
    const bOrder = statusOrder[b.uploadStatus || 'pending'];
    return aOrder - bOrder;
  });

  return (
    <div className={`file-uploader-container`} ref={containerRef}>
      <div className="file-uploader-header">
        <h2>Image Upload</h2>
        <p className="file-uploader-subtitle">
          Upload images (JPG, PNG, GIF, WEBP) - Max 5MB per file
        </p>
      </div>

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

      <div className="uploader-content-wrapper">
        <React.Suspense fallback={<Loader text="Loading DropZone..." />}>
          <DropZone
            onFileSelect={handleFileSelect}
            onFileDropped={processFiles}
            hasFiles={uploadedFiles.length > 0}
          />
          <MobileGalleryUploader onFileSelect={handleFileSelect} />
        </React.Suspense>
        <div id="upload-container"></div>

        {(uploadingCount > 0 || successCount > 0) && (
          <div className="overall-progress-section">
            <div className="overall-progress-header">
              {successCount === uploadedFiles.length ? (
                <span style={{ color: 'green' }}>
                  ✓ All files uploaded successfully! {successCount} of {uploadedFiles.length} files complete.
                </span>
              ) : (
                <>
                  <span>Uploading {uploadingCount} file{uploadingCount > 1 ? 's' : ''}...</span>
                  <span>{Math.round(overallProgress)}%</span>
                </>
              )}
            </div>
            <div className="overall-progress-bar">
              <div
                className="overall-progress-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files-section">
            <div className="uploaded-files-header">
              <h3>Uploaded Files ({successCount})</h3>
              <button className="clear-all-button" onClick={clearAllFiles} type="button">
                Clear All
              </button>
            </div>

            {/* {uploadedFiles.length !== successCount ? ( */}
            <div className="uploaded-files-grid">
              <React.Suspense fallback={<Loader text="Loading uploaded files..." />}>
                {sortedFiles.map((uploadedFile) => (
                  <FileCard key={uploadedFile.id} file={uploadedFile} onReUpload={reuploadFile} />
                ))}
              </React.Suspense>
            </div>
          </div>
        )}
      </div>
      <React.Suspense fallback={null}>
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          isPersistent={toast.isPersistent}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </React.Suspense>
    </div>
  );
};

export default FileUploader;
