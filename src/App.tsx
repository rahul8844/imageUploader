import { Suspense, lazy } from 'react';
import Loader from './components/Loader/Loader';
import './App.css';

// Lazy load the FileUploader component for code splitting
const FileUploader = lazy(() => import('./components/FileUploader'));
const FileUploaderContext = lazy(() => import('./components/FileUploaderContext'));

const App = () => (
  <div className="app" id="app">
    <Suspense fallback={<Loader text="Loading App..." />}>
      <FileUploaderContext>
        <FileUploader />
      </FileUploaderContext>
    </Suspense>
  </div>
);

export default App;
