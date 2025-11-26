import { useCallback, useRef, useState } from "react";
import type { IDropZoneProps } from "../types/files";
import './FileUploader.css';

const DropZone: React.FC<IDropZoneProps> = (props) => {
  const { hasFiles = false, onFileSelect, onFileDropped } = props;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onFileDropped(files);
    },
    [onFileDropped]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''} ${hasFiles ? 'has-files' : ''}`}
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
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default DropZone;