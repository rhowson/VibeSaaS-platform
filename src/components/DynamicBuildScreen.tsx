'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Assignment,
  Timeline,
  Build,
  Done,
} from '@mui/icons-material';

interface ProgressEvent {
  type: 'extracting' | 'reviewing' | 'questioning' | 'generating_phases' | 'expanding_phase' | 'finalizing';
  message: string;
  phase?: number;
  totalPhases?: number;
  timestamp: string;
}

interface DynamicBuildScreenProps {
  progress: ProgressEvent[];
  currentPhase: number;
  totalPhases: number;
}

export default function DynamicBuildScreen({
  progress,
  currentPhase,
  totalPhases,
}: DynamicBuildScreenProps) {
  const steps = [
    {
      label: 'Extracting Information',
      icon: <Search />,
      description: 'Analyzing project idea and documents',
      type: 'extracting',
    },
    {
      label: 'Reviewing Details',
      icon: <CheckCircle />,
      description: 'Identifying key requirements and constraints',
      type: 'reviewing',
    },
    {
      label: 'Gathering Context',
      icon: <Assignment />,
      description: 'Asking follow-up questions',
      type: 'questioning',
    },
    {
      label: 'Generating Phases',
      icon: <Timeline />,
      description: 'Creating project phase outline',
      type: 'generating_phases',
    },
    {
      label: 'Expanding Tasks',
      icon: <Build />,
      description: 'Adding detailed tasks to each phase',
      type: 'expanding_phase',
    },
    {
      label: 'Finalizing Plan',
      icon: <Done />,
      description: 'Completing project plan',
      type: 'finalizing',
    },
  ];

  const getCurrentStep = () => {
    if (progress.length === 0) return 0;
    
    const lastEvent = progress[progress.length - 1];
    const stepIndex = steps.findIndex(step => step.type === lastEvent.type);
    return Math.max(0, stepIndex);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentStep = getCurrentStep();
    const step = steps[stepIndex];
    
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const getProgressPercentage = () => {
    if (progress.length === 0) return 0;
    
    const currentStep = getCurrentStep();
    const totalSteps = steps.length;
    
    if (currentStep === totalSteps - 1) {
      // In the final step, calculate based on phases
      if (totalPhases > 0) {
        return Math.min(95, 80 + (currentPhase / totalPhases) * 15);
      }
      return 90;
    }
    
    return (currentStep / totalSteps) * 100;
  };

  const getCurrentMessage = () => {
    if (progress.length === 0) return 'Starting analysis...';
    
    const lastEvent = progress[progress.length - 1];
    return lastEvent.message;
  };

  const getPhaseProgress = () => {
    if (totalPhases === 0) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Phase {currentPhase} of {totalPhases}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(currentPhase / totalPhases) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    );
  };

  return (
    <Box>
      <MainCard>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CircularProgress
              variant="determinate"
              value={getProgressPercentage()}
              size={120}
              thickness={4}
              sx={{ mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              {Math.round(getProgressPercentage())}% Complete
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {getCurrentMessage()}
            </Typography>
            {getPhaseProgress()}
          </Box>

          <Stepper orientation="vertical" activeStep={getCurrentStep()}>
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isActive = status === 'active';
              const isCompleted = status === 'completed';
              
              return (
                <Step key={step.type} active={isActive} completed={isCompleted}>
                  <StepLabel
                    icon={
                      isCompleted ? (
                        <CheckCircle color="success" />
                      ) : isActive ? (
                        <CircularProgress size={20} />
                      ) : (
                        step.icon
                      )
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {step.label}
                      </Typography>
                      {isActive && (
                        <Chip
                          label="In Progress"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    
                    {/* Show recent progress events for this step */}
                    {isActive && (
                      <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary">
                          Recent activity:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {progress
                            .filter(event => event.type === step.type)
                            .slice(-3)
                            .map((event, idx) => (
                              <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                • {event.message}
                              </Typography>
                            ))}
                        </Box>
                      </Paper>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </MainCard>

      {/* Recent Activity */}
      {progress.length > 0 && (
        <MainCard sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {progress.slice(-10).reverse().map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1,
                    borderBottom: index < progress.slice(-10).length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Chip
                    label={event.type.replace(/_/g, ' ').toUpperCase()}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
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
