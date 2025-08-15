'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';
import DynamicBuildScreen from '@/components/DynamicBuildScreen';

interface ProgressEvent {
  type: 'extracting' | 'reviewing' | 'questioning' | 'generating_phases' | 'expanding_phase' | 'finalizing';
  message: string;
  phase?: number;
  totalPhases?: number;
  timestamp: string;
}

export default function PlanGeneration() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [totalPhases, setTotalPhases] = useState(0);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const startPlanGeneration = async () => {
    setIsGenerating(true);
    setError('');
    setProgress([]);
    setCurrentPhase(0);
    setTotalPhases(0);
    setIsComplete(false);

    try {
      // Start the plan generation process
      const response = await fetch('/api/ai/plan/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start plan generation');
      }

      // Start listening to progress events
      startProgressStream();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start plan generation');
      setIsGenerating(false);
    }
  };

  const startProgressStream = () => {
    const eventSource = new EventSource(`/api/progress/stream?projectId=${projectId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          setProgress(prev => [...prev, data.event]);
          
          if (data.event.type === 'generating_phases') {
            setTotalPhases(data.event.totalPhases || 0);
          } else if (data.event.type === 'expanding_phase') {
            setCurrentPhase(data.event.phase || 0);
          } else if (data.event.type === 'finalizing') {
            setIsComplete(true);
            setIsGenerating(false);
            eventSource.close();
          }
        }
      } catch (error) {
        console.error('Failed to parse progress event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Progress stream error:', error);
      eventSource.close();
      setError('Lost connection to progress stream');
      setIsGenerating(false);
    };
  };

  const handleViewPlan = () => {
    router.push(`/projects/manage/${projectId}`);
  };

  const handleRetry = () => {
    startPlanGeneration();
  };

  return (
    <Box sx={{ p: 3 }}>
      <ComponentHeader
        title="Generating Project Plan"
        description="AI is creating a comprehensive project plan with phases and tasks"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!isGenerating && !isComplete && (
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Ready to Generate Plan
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Based on your project idea, selected information, and answers to our questions, 
              AI will now generate a comprehensive project plan with phases and tasks.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={startPlanGeneration}
            >
              Start Plan Generation
            </Button>
          </Box>
        </MainCard>
      )}

      {isGenerating && (
        <DynamicBuildScreen
          progress={progress}
          currentPhase={currentPhase}
          totalPhases={totalPhases}
        />
      )}

      {isComplete && (
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="success.main">
              Plan Generation Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your project plan has been successfully generated with {totalPhases} phases and multiple tasks.
              You can now review, edit, and manage your project plan.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleViewPlan}
              >
                View Project Plan
              </Button>
              <Button
                variant="outlined"
                onClick={handleRetry}
              >
                Regenerate Plan
              </Button>
            </Box>
          </Box>
        </MainCard>
      )}

      {progress.length > 0 && (
        <MainCard sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generation Progress
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {progress.map((event, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={event.type.replace(/_/g, ' ').toUpperCase()}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2">
                    {event.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </MainCard>
      )}
    </Box>
  );
}
