'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Edit,
  Delete,
  Schedule,
  Assignment,
} from '@mui/icons-material';

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

interface PhaseTaskBoardProps {
  phases: Phase[];
  projectId: string;
  onPhasesUpdate: (phases: Phase[]) => void;
}

export default function PhaseTaskBoard({
  phases,
  projectId,
  onPhasesUpdate,
}: PhaseTaskBoardProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | false>(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    type: 'phase' | 'task';
    data: any;
    phaseId?: string;
  }>({
    open: false,
    type: 'phase',
    data: {},
  });

  const handlePhaseExpand = (phaseId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPhase(isExpanded ? phaseId : false);
  };

  const handleEditPhase = (phase: Phase) => {
    setEditDialog({
      open: true,
      type: 'phase',
      data: phase,
    });
  };

  const handleEditTask = (task: Task, phaseId: string) => {
    setEditDialog({
      open: true,
      type: 'task',
      data: task,
      phaseId,
    });
  };

  const handleAddTask = (phaseId: string) => {
    setEditDialog({
      open: true,
      type: 'task',
      data: {
        title: '',
        description: '',
        duration_days: 1,
        depends_on: [],
      },
      phaseId,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const { type, data, phaseId } = editDialog;
      
      if (type === 'phase') {
        const response = await fetch(`/api/phases/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          const updatedPhase = await response.json();
          const updatedPhases = phases.map(p => 
            p.id === updatedPhase.id ? { ...p, ...updatedPhase } : p
          );
          onPhasesUpdate(updatedPhases);
        }
      } else if (type === 'task' && phaseId) {
        const url = data.id 
          ? `/api/tasks/${data.id}`
          : `/api/phases/${phaseId}/tasks`;
        
        const method = data.id ? 'PATCH' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          // Reload phases to get updated data
          const phasesResponse = await fetch(`/api/projects/${projectId}/phases`);
          if (phasesResponse.ok) {
            const updatedPhases = await phasesResponse.json();
            onPhasesUpdate(updatedPhases);
          }
        }
      }
      
      setEditDialog({ open: false, type: 'phase', data: {} });
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Are you sure you want to delete this phase? This will also delete all tasks in this phase.')) {
      return;
    }

    try {
      const response = await fetch(`/api/phases/${phaseId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const updatedPhases = phases.filter(p => p.id !== phaseId);
        onPhasesUpdate(updatedPhases);
      }
    } catch (error) {
      console.error('Failed to delete phase:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Reload phases to get updated data
        const phasesResponse = await fetch(`/api/projects/${projectId}/phases`);
        if (phasesResponse.ok) {
          const updatedPhases = await phasesResponse.json();
          onPhasesUpdate(updatedPhases);
        }
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Project Phases & Tasks
      </Typography>

      {phases.map((phase) => (
        <Card key={phase.id} sx={{ mb: 2 }}>
          <Accordion
            expanded={expandedPhase === phase.id}
            onChange={handlePhaseExpand(phase.id)}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Phase {phase.idx}: {phase.title}
                </Typography>
                <Chip 
                  label={`${phase.tasks.length} tasks`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPhase(phase);
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhase(phase.id);
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {phase.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Tasks</Typography>
                <Button
                  startIcon={<Add />}
                  size="small"
                  onClick={() => handleAddTask(phase.id)}
                >
                  Add Task
                </Button>
              </Box>

              <List>
                {phase.tasks.map((task, index) => (
                  <Box key={task.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {task.title}
                            </Typography>
                            <Chip
                              icon={<Schedule />}
                              label={`${task.duration_days} day${task.duration_days > 1 ? 's' : ''}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                            {task.depends_on.length > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                Depends on: {task.depends_on.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleEditTask(task, phase.id)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < phase.tasks.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, type: 'phase', data: {} })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editDialog.type === 'phase' ? 'Edit Phase' : 'Edit Task'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editDialog.data.title || ''}
            onChange={(e) => setEditDialog({
              ...editDialog,
              data: { ...editDialog.data, title: e.target.value }
            })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={editDialog.data.description || ''}
            onChange={(e) => setEditDialog({
              ...editDialog,
              data: { ...editDialog.data, description: e.target.value }
            })}
            sx={{ mb: 2 }}
          />
          {editDialog.type === 'task' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Duration (days)</InputLabel>
              <Select
                value={editDialog.data.duration_days || 1}
                label="Duration (days)"
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  data: { ...editDialog.data, duration_days: e.target.value }
                })}
              >
                {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(days => (
                  <MenuItem key={days} value={days}>{days} day{days > 1 ? 's' : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, type: 'phase', data: {} })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
