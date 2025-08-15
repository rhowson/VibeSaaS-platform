'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Chip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';
import PhaseTaskBoard from '@/components/PhaseTaskBoard';

interface Project {
  id: string;
  name: string;
  idea_text: string;
  status: string;
  created_at: string;
}

interface Phase {
  id: string;
  idx: number;
  title: string;
  description: string;
  tasks: Task[];
}

interface Task {
  id: string;
  idx: number;
  title: string;
  description: string;
  duration_days: number;
  depends_on: string[];
}

export default function ManageProject() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const [projectResponse, phasesResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/phases`)
      ]);

      if (!projectResponse.ok || !phasesResponse.ok) {
        throw new Error('Failed to load project data');
      }

      const projectData = await projectResponse.json();
      const phasesData = await phasesResponse.json();

      setProject(projectData);
      setPhases(phasesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'extracting':
        return 'warning';
      case 'planning':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Project not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ComponentHeader title={project.name} description="Manage your project phases and tasks" />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Chip label={project.status} color={getStatusColor(project.status) as any} size="small" />
        <Typography variant="body2" color="text.secondary">
          Created {new Date(project.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      {project.status === 'draft' && (
        <MainCard sx={{ mb: 3 }}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Ready to Start AI Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your project idea has been saved. Click below to start the AI-powered analysis and planning process.
            </Typography>
            <Button variant="contained" size="large" onClick={() => router.push(`/projects/manage/${projectId}/extract`)}>
              Start AI Analysis
            </Button>
          </Box>
        </MainCard>
      )}

      {project.status === 'extracting' && (
        <MainCard sx={{ mb: 3 }}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI is Analyzing Your Project
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Extracting key details from your project idea and documents...
            </Typography>
          </Box>
        </MainCard>
      )}

      {phases.length > 0 && <PhaseTaskBoard phases={phases} projectId={projectId} onPhasesUpdate={setPhases} />}

      {project.status === 'completed' && phases.length === 0 && (
        <MainCard>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Phases Generated Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The AI analysis is complete, but no phases were generated. You can manually create phases or restart the analysis.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => router.push(`/projects/manage/${projectId}/extract`)}>
                Restart Analysis
              </Button>
              <Button variant="outlined" onClick={() => router.push(`/projects/manage/${projectId}/phases/create`)}>
                Create Phase Manually
              </Button>
            </Box>
          </Box>
        </MainCard>
      )}
    </Box>
  );
}
