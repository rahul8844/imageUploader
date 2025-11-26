export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    url: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}
