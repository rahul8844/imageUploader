import { useContext } from "react";
import { FileDropContext } from "../../FileUploaderContext/FileDropContextWrapper";
import type { FileCardProps } from "../../../types/files";
import '../FileUploader.css';

const FileCard: React.FC<FileCardProps> = (props) => {
  const { file: currentFile, onReUpload } = props;
  const { setUploadedFiles } = useContext(FileDropContext);

  const retryUpload = () => {
    if (currentFile && currentFile.uploadStatus === 'error') {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === currentFile.id
            ? { ...f, uploadStatus: 'pending' as const, uploadProgress: 0, error: undefined }
            : f
        )
      );
      onReUpload?.(currentFile);
    }
  };

  const removeFile = async () => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === currentFile.id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== currentFile.id);
    });
  };

  return (
    <div key={currentFile.id} className={`file-preview-card ${currentFile.uploadStatus || ''}`}>
      <div className="file-preview-image-wrapper">
        <img
          src={currentFile.preview}
          alt={currentFile.file.name}
          className="file-preview-image"
        />

        {/* Upload Status Overlay */}
        {['uploading', 'pending'].includes(currentFile?.uploadStatus ?? '') && (
          <div className="upload-overlay">
            <div className="upload-spinner"></div>
          </div>
        )}

        {currentFile.uploadStatus === 'success' && (
          <div className="upload-overlay success-overlay">
            <div className="success-check">✓</div>
          </div>
        )}

        {currentFile.uploadStatus === 'error' && (
          <div className="upload-overlay error-overlay">
            <div className="error-icon-large">✕</div>
          </div>
        )}

        <button
          className="remove-file-button"
          onClick={removeFile}
          type="button"
          aria-label="Remove file"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* File Info with Progress */}
      <div className="file-preview-info">
        <p className="file-name" title={currentFile.file.name}>
          {currentFile.file.name}
        </p>
        <p className="file-size">
          {(currentFile.file.size / 1024).toFixed(2)} KB
        </p>

        {/* Individual File Progress Bar */}
        {currentFile.uploadStatus === 'uploading' && (
          <div className="file-progress-bar">
            <div
              className="file-progress-fill"
              style={{ width: `${currentFile.uploadProgress || 0}%` }}
            />
          </div>
        )}

        {/* Status Badge */}
        {currentFile.uploadStatus === 'success' && (
          <span className="status-badge success-badge">Uploaded</span>
        )}
        {currentFile.uploadStatus === 'error' && (
          <>
            <span className="status-badge error-badge">
              {currentFile.error || 'Failed'}
            </span>
            <button
              className="retry-upload-button"
              onClick={retryUpload}
              type="button"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3 3 18.1 4.7 19.6 7.2M21 3V7M21 7H17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default FileCard