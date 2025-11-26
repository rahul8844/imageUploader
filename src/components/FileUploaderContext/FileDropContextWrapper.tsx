import React, { useState, createContext, type ReactNode, useMemo } from "react";
import type { UploadedFile } from "../../types/files";
import type { FileDropContextType } from "../../types/uploader";

export const FileDropContext = createContext<FileDropContextType>({
  uploadedFiles: [],
  setUploadedFiles: () => { }
});

const FileDropContextWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const value = useMemo(() => ({
    uploadedFiles,
    setUploadedFiles
  }), [JSON.stringify(uploadedFiles)]);

  return (
    <FileDropContext.Provider value={value}>
      {children}
    </FileDropContext.Provider>
  )
}

export default FileDropContextWrapper;