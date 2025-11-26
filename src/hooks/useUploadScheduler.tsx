import { useContext, useCallback, useMemo } from "react";
import { FileDropContext } from "../components/FileUploaderContext/FileDropContextWrapper";
import { UploadScheduler } from "../services/uploadScheduler";

export const useUploadScheduler = () => {
  const { setUploadedFiles } = useContext(FileDropContext);

  const onProgress = useCallback((taskId: string, progress: number) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === taskId
          ? { ...f, uploadProgress: progress, uploadStatus: 'uploading' as const }
          : f
      )
    );
  }, []);

  const onSuccess = useCallback((taskId: string, url: string, publicId: string) => {
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
  }, []);

  const onError = useCallback((taskId: string, error: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === taskId ? { ...f, uploadStatus: 'error' as const, error } : f
      )
    );
  }, []);

  const onQueueUpdate = useCallback((queueLength: number, activeCount: number) => {
    console.log('[onQueueUpdate]', { queueLength, activeCount });
  }, []);

  const uploadScheduler = useMemo(() => {
    return new UploadScheduler({
      maxConcurrent: 10,
      onProgress,
      onSuccess,
      onError,
      onQueueUpdate
    });
  }, [onProgress, onSuccess, onError, onQueueUpdate]);

  return { uploadScheduler };
}