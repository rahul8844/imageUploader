import type { FileCardProps, UploadedFile } from "../types/files";
import './FileUploader.css';

const FileCard: React.FC<FileCardProps> = (props) => {
    const { file: uploadedFile, onRemoveFile } = props;
    return (
        <div key={uploadedFile.id} className={`file-preview-card ${uploadedFile.uploadStatus || ''}`}>
            <div className="file-preview-image-wrapper">
                <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="file-preview-image"
                />

                {/* Upload Status Overlay */}
                {uploadedFile.uploadStatus === 'uploading' && (
                    <div className="upload-overlay">
                        <div className="upload-spinner"></div>
                    </div>
                )}

                {uploadedFile.uploadStatus === 'success' && (
                    <div className="upload-overlay success-overlay">
                        <div className="success-check">✓</div>
                    </div>
                )}

                {uploadedFile.uploadStatus === 'error' && (
                    <div className="upload-overlay error-overlay">
                        <div className="error-icon-large">✕</div>
                    </div>
                )}

                <button
                    className="remove-file-button"
                    onClick={() => onRemoveFile(uploadedFile.id)}
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
                <p className="file-name" title={uploadedFile.file.name}>
                    {uploadedFile.file.name}
                </p>
                <p className="file-size">
                    {(uploadedFile.file.size / 1024).toFixed(2)} KB
                </p>

                {/* Individual File Progress Bar */}
                {uploadedFile.uploadStatus === 'uploading' && (
                    <div className="file-progress-bar">
                        <div
                            className="file-progress-fill"
                            style={{ width: `${uploadedFile.uploadProgress || 0}%` }}
                        />
                    </div>
                )}

                {/* Status Badge */}
                {uploadedFile.uploadStatus === 'success' && (
                    <span className="status-badge success-badge">Uploaded</span>
                )}
                {uploadedFile.uploadStatus === 'error' && (
                    <span className="status-badge error-badge">
                        {uploadedFile.error || 'Failed'}
                    </span>
                )}
            </div>
        </div>
    )
}

export default FileCard