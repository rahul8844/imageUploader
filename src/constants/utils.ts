import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "./constants";

export const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        return `${file.name}: Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.`;
    }

    if (file.size > MAX_FILE_SIZE) {
        return `${file.name}: File size exceeds 5MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    return null;
};