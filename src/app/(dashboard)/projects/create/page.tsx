'use client';

import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';
import UploadDropzone from '@/components/UploadDropzone';

export default function CreateProject() {
  const router = useRouter();
  const [ideaText, setIdeaText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProject = async () => {
    if (!ideaText.trim()) {
      setError('Please enter a project idea');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: ideaText.substring(0, 50) + '...',
          idea_text: ideaText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();
      
      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await uploadFile(project.id, file);
        }
      }

      // Redirect to extraction review
      router.push(`/projects/manage/${project.id}/extract`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (projectId: string, file: File) => {
    // Get signed URL
    const signResponse = await fetch('/api/uploads/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        projectId,
      }),
    });

    if (!signResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { url, fields } = await signResponse.json();

    // Upload to Supabase Storage
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append('file', file);

    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <ComponentHeader
        title="Create New Project"
        description="Turn your project idea into a structured plan with AI assistance"
      />
      
      <MainCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Project Idea
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder="Describe your project idea in detail. Include goals, requirements, constraints, and any specific needs..."
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Upload Documents (Optional)
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Upload relevant documents to help AI understand your project better. 
            Supported formats: PDF, DOCX, TXT, Markdown
          </Typography>

          <UploadDropzone
            onFilesSelected={setUploadedFiles}
            acceptedTypes={['.pdf', '.docx', '.txt', '.md']}
            maxFiles={10}
            maxSize={25 * 1024 * 1024} // 25MB
          />

          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files:
              </Typography>
              {uploadedFiles.map((file, index) => (
                <Typography key={index} variant="body2" color="textSecondary">
                  • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              ))}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateProject}
              disabled={isLoading || !ideaText.trim()}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Creating Project...' : 'Create Project & Start AI Analysis'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Box>
        </CardContent>
      </MainCard>
    </Box>
  );
}
