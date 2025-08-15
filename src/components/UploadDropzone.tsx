'use client';

import { useCallback, useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, FileUpload } from '@mui/icons-material';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
}

export default function UploadDropzone({
  onFilesSelected,
  acceptedTypes = [],
  maxFiles = 10,
  maxSize = 25 * 1024 * 1024, // 25MB default
  disabled = false,
}: UploadDropzoneProps) {
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((e: any) => {
          if (e.code === 'file-too-large') {
            return `${file.name} is too large (max ${(maxSize / 1024 / 1024).toFixed(0)}MB)`;
          }
          if (e.code === 'file-invalid-type') {
            return `${file.name} has an invalid file type`;
          }
          if (e.code === 'too-many-files') {
            return `Too many files (max ${maxFiles})`;
          }
          return `${file.name}: ${e.message}`;
        });
        return errorMessages.join(', ');
      });
      setError(errors.join('; '));
      return;
    }

    onFilesSelected(acceptedFiles);
  }, [onFilesSelected, maxFiles, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.length > 0 ? acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>) : undefined,
    maxFiles,
    maxSize,
    disabled,
  });

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        
        {isDragActive ? (
          <Box>
            <FileUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary.main">
              Drop files here...
            </Typography>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & drop files here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select files
            </Typography>
            
            {acceptedTypes.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Accepted formats: {acceptedTypes.join(', ')}
              </Typography>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each
            </Typography>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
