import { Suspense, lazy } from 'react';
import './App.css';

// Lazy load the FileUploader component for code splitting
const FileUploader = lazy(() => import('./components/FileUploader'));

function App() {
  const handleFilesSelected = (files: File[]) => {
    console.log('Files selected:', files);
    // Here add upload logic (e.g., to a server, cloud storage, etc.)
  };

  return (
    <div className="app">
      <Suspense fallback={
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading uploader...</p>
        </div>
      }>
        <FileUploader
          onFilesSelected={handleFilesSelected}
          maxFiles={10}
        />
      </Suspense>
    </div>
  );
}

export default App;
