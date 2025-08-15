'use client';

import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load heavy components
export const LazyUploadDropzone = lazy(() => import('./UploadDropzone'));
export const LazyEmojiPicker = lazy(() => import('emoji-picker-react'));
export const LazyReactDropzone = lazy(() => import('react-dropzone'));

// Loading component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <CircularProgress size={24} />
  </Box>
);

// Wrapper component for lazy loading
export const LazyComponent = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;

// Specific lazy components with loading states
export const LazyUploadDropzoneWithFallback = (props: any) => (
  <LazyComponent>
    <LazyUploadDropzone {...props} />
  </LazyComponent>
);

export const LazyEmojiPickerWithFallback = (props: any) => (
  <LazyComponent>
    <LazyEmojiPicker {...props} />
  </LazyComponent>
);
