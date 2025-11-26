# Image Uploader

A modern, responsive image uploader component built with React, TypeScript, and Vite. Features Cloudinary integration for secure image hosting.

## Features

-   **Drag & Drop Interface**: Intuitive file selection.
-   **Multi-file Upload**: Support for batch uploads.
-   **Progress Tracking**: Real-time upload progress for individual files and overall batch.
-   **Cloudinary Integration**: Direct secure uploads to Cloudinary.
-   **Mobile Friendly**: Responsive design with specific mobile gallery access.
-   **Virtualization**: Efficient rendering of large file lists using `react-window`.
-   **Retry Mechanism**: Easily retry failed uploads.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: Version 18 or higher is recommended.
    -   [Download Node.js](https://nodejs.org/)

## Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the root directory and add your Cloudinary credentials:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

> **Note**: You can find these credentials in your Cloudinary Dashboard settings.

## Running Locally

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Linting

To run the linter and check for code quality issues:

```bash
npm run lint
```

## Technologies Used

-   [React](https://react.dev/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Vite](https://vitejs.dev/)
-   [Cloudinary](https://cloudinary.com/)
-   [react-window](https://github.com/bvaughn/react-window)
