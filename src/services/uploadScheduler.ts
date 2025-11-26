import { uploadToCloudinary } from './cloudinary';
import type { UploadTask, UploadSchedulerConfig } from '../types/scheduler';

/**
 * Upload Scheduler - Manages concurrent file uploads with queue system
 * 
 * Features:
 * - Configurable concurrency limit (default: 10)
 * - Automatic queue processing
 * - Progress tracking for each file
 * - Error handling with retry capability
 */
export class UploadScheduler {
    private queue: UploadTask[] = [];
    private activeUploads: Set<string> = new Set();
    private maxConcurrent: number;
    private onProgress?: (taskId: string, progress: number) => void;
    private onSuccess?: (taskId: string, url: string, publicId: string) => void;
    private onError?: (taskId: string, error: string) => void;
    private onQueueUpdate?: (queueLength: number, activeCount: number) => void;

    constructor(config: UploadSchedulerConfig = {}) {
        this.maxConcurrent = config.maxConcurrent || 10;
        this.onProgress = config.onProgress;
        this.onSuccess = config.onSuccess;
        this.onError = config.onError;
        this.onQueueUpdate = config.onQueueUpdate;
    }

    /**
     * Add files to the upload queue
     */
    addToQueue(files: { id: string; file: File }[]): void {
        const tasks: UploadTask[] = files.map((f) => ({
            id: f.id,
            file: f.file,
            status: 'queued',
            progress: 0,
        }));

        this.queue.push(...tasks);
        this.notifyQueueUpdate();
        this.processQueue();
    }

    /**
     * Process the queue - start uploads up to maxConcurrent limit
     */
    private async processQueue(): Promise<void> {
        while (
            this.queue.length > 0 &&
            this.activeUploads.size < this.maxConcurrent
        ) {
            const task = this.queue.shift();
            if (!task) break;

            this.uploadTask(task);
        }
    }

    /**
     * Upload a single task
     */
    private async uploadTask(task: UploadTask): Promise<void> {
        this.activeUploads.add(task.id);
        task.status = 'uploading';
        this.notifyQueueUpdate();

        try {
            // Upload with progress tracking
            const response = await uploadToCloudinary(task.file, (progress) => {
                task.progress = progress;
                this.onProgress?.(task.id, progress);
            });

            // Success
            task.status = 'success';
            task.progress = 100;
            task.cloudinaryUrl = response.secure_url;
            task.cloudinaryPublicId = response.public_id;

            this.onSuccess?.(task.id, response.secure_url, response.public_id);
        } catch (error) {
            // Error
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            task.status = 'error';
            task.error = errorMessage;

            this.onError?.(task.id, errorMessage);
        } finally {
            // Remove from active uploads
            this.activeUploads.delete(task.id);
            this.notifyQueueUpdate();

            // Process next item in queue
            this.processQueue();
        }
    }

    /**
     * Notify about queue state changes
     */
    private notifyQueueUpdate(): void {
        this.onQueueUpdate?.(this.queue.length, this.activeUploads.size);
    }

    /**
     * Get current queue status
     */
    getStatus(): {
        queueLength: number;
        activeCount: number;
        isProcessing: boolean;
    } {
        return {
            queueLength: this.queue.length,
            activeCount: this.activeUploads.size,
            isProcessing: this.queue.length > 0 || this.activeUploads.size > 0,
        };
    }

    /**
     * Clear the queue (doesn't stop active uploads)
     */
    clearQueue(): void {
        this.queue = [];
        this.notifyQueueUpdate();
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<UploadSchedulerConfig>): void {
        if (config.maxConcurrent !== undefined) {
            this.maxConcurrent = config.maxConcurrent;
        }
        if (config.onProgress) this.onProgress = config.onProgress;
        if (config.onSuccess) this.onSuccess = config.onSuccess;
        if (config.onError) this.onError = config.onError;
        if (config.onQueueUpdate) this.onQueueUpdate = config.onQueueUpdate;
    }
}
