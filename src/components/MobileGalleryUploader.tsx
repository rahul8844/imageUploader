import { useEffect, useRef, useState } from "react";
import type { IMobileGalleryUploader } from "../types/uploader";
import './FileUploader.css';

const MobileGalleryUploader: React.FC<IMobileGalleryUploader> = ({ onFileSelect }) => {
    const [isMobile, setIsMobile] = useState(false);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleGalleryClick = () => {
        if (galleryInputRef.current) {
            galleryInputRef.current.click();
        }
    };

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) || window.innerWidth <= 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isMobile) {
        return null;
    }

    return (
        <div className="mobile-gallery-section">
            <button
                className="gallery-button"
                onClick={handleGalleryClick}
                type="button"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M21 15L16 10L5 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                Upload from Gallery
            </button>
            <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={onFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    )
};

export default MobileGalleryUploader;
