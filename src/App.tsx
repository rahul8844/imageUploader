import { Suspense, lazy } from 'react';
import './App.css';

// Lazy load the FileUploader component for code splitting
const FileUploader = lazy(() => import('./components/FileUploader'));
const FileUploaderContext = lazy(() => import('./components/FileUploaderContext'));

const App = () => (
  <div className="app" id="app">
    <Suspense fallback={
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading uploader...</p>
      </div>
    }>
      <FileUploaderContext>
        <FileUploader />
      </FileUploaderContext>
    </Suspense>
  </div>
);

export default App;
