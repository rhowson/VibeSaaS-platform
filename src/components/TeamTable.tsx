'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import { Edit, Delete, Person } from '@mui/icons-material';

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  added_at: string;
}

interface TeamTableProps {
  members: TeamMember[];
  onRoleChange: (memberId: string, newRole: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export default function TeamTable({ members, onRoleChange, onRemoveMember }: TeamTableProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'error';
      case 'admin':
        return 'primary';
      case 'editor':
        return 'warning';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  const canChangeRole = (member: TeamMember) => {
    // Only allow role changes for non-owner members
    return member.role !== 'owner';
  };

  const canRemoveMember = (member: TeamMember) => {
    // Only allow removal of non-owner members
    return member.role !== 'owner';
  };

  if (members.length === 0) {
    return (
      <MainCard>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Team Members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invite team members to collaborate on this project.
          </Typography>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Team Members ({members.length})
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Added</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>{member.full_name.charAt(0).toUpperCase()}</Avatar>
                      <Typography variant="body2">{member.full_name}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {member.email}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {canChangeRole(member) ? (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select value={member.role} onChange={(e) => onRoleChange(member.id, e.target.value)} sx={{ height: 32 }}>
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="editor">Editor</MenuItem>
                          <MenuItem value="viewer">Viewer</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip label={getRoleLabel(member.role)} color={getRoleColor(member.role) as any} size="small" />
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(member.added_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    {canRemoveMember(member) && (
                      <IconButton size="small" color="error" onClick={() => onRemoveMember(member.id)} title="Remove member">
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </MainCard>
  );
}
