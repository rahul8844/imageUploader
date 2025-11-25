import React, { useState, useRef, useCallback, useEffect } from 'react';
import MobileGalleryUploader from './MobileGalleryUploader';
import FileCard from './FileCard';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../constants';
import type { UploadedFile } from '../types/files';
import type { FileUploaderProps } from '../types/uploader';
import './FileUploader.css';

const FileUploader: React.FC<FileUploaderProps> = ({
    onFilesSelected,
    onUpload,
    maxFiles = 10,
    autoUpload = true
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const uploadFile = async (fileId: string, file: File) => {
        // Write Functionality to upload
    };

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            return `${file.name}: Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.`;
        }

        // Check file size
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
                setUploadedFiles((prev) => {
                    const combined = [...prev, ...validFiles];
                    const limited = combined.slice(0, maxFiles);

                    if (combined.length > maxFiles) {
                        setErrors((prevErrors) => [
                            ...prevErrors,
                            `Maximum ${maxFiles} files allowed. Some files were not added.`
                        ]);
                    }

                    return limited;
                });

                if (onFilesSelected) {
                    onFilesSelected(validFiles.map((f) => f.file));
                }

                // Auto-upload if enabled
                if (autoUpload) {
                    validFiles.forEach((vf) => {
                        uploadFile(vf.id, vf.file);
                    });
                }

                // Show success notification after last file completes
                setTimeout(() => {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 5000);
                }, validFiles.length * 1500);
            }
        },
        [maxFiles, onFilesSelected, autoUpload]
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Only set dragging to false if we're leaving the drop zone entirely
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            processFiles(files);
        },
        [processFiles]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            processFiles(e.target.files);
            // Reset input value to allow selecting the same file again
            e.target.value = '';
        },
        [processFiles]
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (id: string) => {
        setUploadedFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file) {
                URL.revokeObjectURL(file.preview);
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

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            uploadedFiles.forEach((file) => {
                URL.revokeObjectURL(file.preview);
            });
        };
    }, []);

    // Calculate overall progress
    const overallProgress =
        uploadedFiles.length > 0
            ? uploadedFiles.reduce((acc, file) => acc + (file.uploadProgress || 0), 0) / uploadedFiles.length
            : 0;

    const uploadingCount = uploadedFiles.filter((f) => f.uploadStatus === 'uploading').length;
    const successCount = uploadedFiles.filter((f) => f.uploadStatus === 'success').length;

    return (
        <div className="file-uploader-container">
            <div className="file-uploader-header">
                <h2>Image Upload</h2>
                <p className="file-uploader-subtitle">
                    Upload images (JPG, PNG, GIF, WEBP) - Max 5MB per file
                </p>
            </div>

            {/* Success Notification */}
            {showSuccess && (
                <div className="success-notification">
                    <span className="success-icon">✓</span>
                    <span className="success-text">
                        All files uploaded successfully! {successCount} of {uploadedFiles.length} files complete.
                    </span>
                </div>
            )}

            {/* Error Messages */}
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

            {/* Overall Progress Indicator */}
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

            {/* Drop Zone */}
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${uploadedFiles.length > 0 ? 'has-files' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className="drop-zone-content">
                    <div className="upload-icon">
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 64 64"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M32 10L32 42M32 10L22 20M32 10L42 20"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M54 42V52C54 53.0609 53.5786 54.0783 52.8284 54.8284C52.0783 55.5786 51.0609 56 50 56H14C12.9391 56 11.9217 55.5786 11.1716 54.8284C10.4214 54.0783 10 53.0609 10 52V42"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <h3 className="drop-zone-title">
                        {isDragging ? 'Drop your images here' : 'Drag & drop images here'}
                    </h3>
                    <p className="drop-zone-text">or</p>
                    <button className="upload-button" type="button">
                        Click to Browse
                    </button>
                    <p className="drop-zone-info">
                        Maximum file size: 5MB • Formats: JPG, PNG, GIF, WEBP
                    </p>
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Mobile Gallery Button */}
            <MobileGalleryUploader onFileSelect={handleFileSelect} />

            {/* Uploaded Files Preview */}
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
                            <FileCard key={uploadedFile.id} file={uploadedFile} onRemoveFile={removeFile} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
