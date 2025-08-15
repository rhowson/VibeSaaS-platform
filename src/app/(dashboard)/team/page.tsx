'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';
import TeamTable from '@/components/TeamTable';

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  added_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadTeamMembers();
    }
  }, [projectId]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to load projects');
      }
      
      const projectsData = await response.json();
      setProjects(projectsData);
      
      if (projectsData.length > 0) {
        setProjectId(projectsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/team?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to load team members');
      }
      
      const members = await response.json();
      setTeamMembers(members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !projectId) {
      setError('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    setError('');

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite team member');
      }

      // Reload team members
      await loadTeamMembers();
      
      // Reset form
      setInviteEmail('');
      setInviteRole('viewer');
      setInviteDialog(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite team member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch('/api/team/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          memberId,
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Reload team members
      await loadTeamMembers();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const response = await fetch('/api/team/member', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          memberId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove team member');
      }

      // Reload team members
      await loadTeamMembers();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
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
        title="Team Management"
        description="Manage team members and their roles for your projects"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Projects Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need to create a project first before you can manage team members.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/projects/create')}
            >
              Create Project
            </Button>
          </Box>
        </MainCard>
      ) : (
        <>
          <MainCard sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Select Project
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setInviteDialog(true)}
                  disabled={!projectId}
                >
                  Invite Team Member
                </Button>
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  value={projectId}
                  label="Project"
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </MainCard>

          {projectId && (
            <TeamTable
              members={teamMembers}
              onRoleChange={handleRoleChange}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            sx={{ mb: 3, mt: 1 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={inviteRole}
              label="Role"
              onChange={(e) => setInviteRole(e.target.value as any)}
            >
              <MenuItem value="admin">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Admin</Typography>
                  <Chip label="Full access" size="small" color="primary" variant="outlined" />
                </Box>
              </MenuItem>
              <MenuItem value="editor">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Editor</Typography>
                  <Chip label="Can edit" size="small" color="warning" variant="outlined" />
                </Box>
              </MenuItem>
              <MenuItem value="viewer">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Viewer</Typography>
                  <Chip label="Read only" size="small" color="default" variant="outlined" />
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInviteMember}
            variant="contained"
            disabled={isInviting || !inviteEmail.trim()}
          >
            {isInviting ? 'Inviting...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
