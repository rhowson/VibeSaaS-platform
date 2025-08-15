'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, Grid, Chip, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  idea_text: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to load projects');
      }
      
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'extracting': return 'warning';
      case 'planning': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'extracting': return 'Analyzing';
      case 'planning': return 'Planning';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ComponentHeader
        title="My Projects"
        description="Manage and view all your AI-assisted project plans"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {projects.length} Project{projects.length !== 1 ? 's' : ''}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/projects/create')}
        >
          Create New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Projects Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first project to start using AI-powered project planning.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/projects/create')}
            >
              Create Your First Project
            </Button>
          </Box>
        </MainCard>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <MainCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1, mr: 2 }}>
                      {project.name}
                    </Typography>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {project.idea_text.length > 150 
                      ? `${project.idea_text.substring(0, 150)}...`
                      : project.idea_text
                    }
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/projects/manage/${project.id}`)}
                      title="View Project"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/projects/manage/${project.id}/edit`)}
                      title="Edit Project"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteProject(project.id)}
                      title="Delete Project"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
