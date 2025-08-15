'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem, Avatar, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';
import { Send, Person, SmartToy } from '@mui/icons-material';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
}

interface Project {
  id: string;
  name: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadMessages();
    }
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const loadMessages = async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/messages?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const messagesData = await response.json();
      setMessages(messagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !projectId) {
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          content: newMessage.trim(),
          role: 'user',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'assistant':
        return <SmartToy />;
      case 'user':
        return <Person />;
      default:
        return <Person />;
    }
  };

  const getMessageColor = (role: string) => {
    switch (role) {
      case 'assistant':
        return 'primary';
      case 'user':
        return 'default';
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

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <ComponentHeader
        title="Project Chat"
        description="Communicate with your team and AI assistant"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <MainCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Projects Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need to create a project first before you can use the chat feature.
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
          {/* Project Selector */}
          <MainCard sx={{ mb: 3 }}>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Select Project</InputLabel>
                <Select
                  value={projectId}
                  label="Select Project"
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

          {/* Chat Messages */}
          <MainCard sx={{ flex: 1, display: 'flex', flexDirection: 'column', mb: 3 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Messages
              </Typography>
              
              <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, minHeight: 400 }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No messages yet. Start a conversation!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          alignItems: 'flex-start',
                          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {message.role !== 'user' && (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {getMessageIcon(message.role)}
                          </Avatar>
                        )}
                        
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                            color: message.role === 'user' ? 'white' : 'text.primary',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                              label={message.role === 'assistant' ? 'AI Assistant' : message.user_name || 'You'}
                              size="small"
                              color={getMessageColor(message.role) as any}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                        </Box>
                        
                        {message.role === 'user' && (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                            {getMessageIcon(message.role)}
                          </Avatar>
                        )}
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>
                )}
              </Box>
              
              {/* Message Input */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                />
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                  startIcon={<Send />}
                  sx={{ minWidth: 100 }}
                >
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </Box>
            </CardContent>
          </MainCard>
        </>
      )}
    </Box>
  );
}
