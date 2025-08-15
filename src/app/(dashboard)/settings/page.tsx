'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';

interface AppSettings {
  ai_provider: 'openai' | 'anthropic';
  openai_model: string;
  anthropic_model: string;
  temperature: number;
  top_p: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    ai_provider: 'openai',
    openai_model: 'gpt-4o-mini',
    anthropic_model: 'claude-3-5-sonnet',
    temperature: 0.2,
    top_p: 1.0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const settingsData = await response.json();
      setSettings(settingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
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
      <ComponentHeader title="Settings" description="Configure AI providers and application preferences" />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <MainCard sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Provider Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose your preferred AI provider and configure model settings. API keys are stored securely on the server.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>AI Provider</InputLabel>
            <Select
              value={settings.ai_provider}
              label="AI Provider"
              onChange={(e) => setSettings((prev) => ({ ...prev, ai_provider: e.target.value as 'openai' | 'anthropic' }))}
            >
              <MenuItem value="openai">
                <Box>
                  <Typography variant="body1">OpenAI (GPT-4)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Powered by GPT-4 models
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="anthropic">
                <Box>
                  <Typography variant="body1">Anthropic (Claude)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Powered by Claude models
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {settings.ai_provider === 'openai' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>OpenAI Model</InputLabel>
              <Select
                value={settings.openai_model}
                label="OpenAI Model"
                onChange={(e) => setSettings((prev) => ({ ...prev, openai_model: e.target.value }))}
              >
                <MenuItem value="gpt-4o-mini">GPT-4o Mini (Fast & Cost-effective)</MenuItem>
                <MenuItem value="gpt-4o">GPT-4o (Most Capable)</MenuItem>
                <MenuItem value="gpt-4-turbo">GPT-4 Turbo (Balanced)</MenuItem>
              </Select>
            </FormControl>
          )}

          {settings.ai_provider === 'anthropic' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Anthropic Model</InputLabel>
              <Select
                value={settings.anthropic_model}
                label="Anthropic Model"
                onChange={(e) => setSettings((prev) => ({ ...prev, anthropic_model: e.target.value }))}
              >
                <MenuItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended)</MenuItem>
                <MenuItem value="claude-3-opus">Claude 3 Opus (Most Capable)</MenuItem>
                <MenuItem value="claude-3-haiku">Claude 3 Haiku (Fastest)</MenuItem>
              </Select>
            </FormControl>
          )}
        </CardContent>
      </MainCard>

      <MainCard sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Response Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Adjust how creative or focused the AI responses should be.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Temperature: {settings.temperature}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Controls randomness. Lower values make responses more focused and deterministic.
            </Typography>
            <Slider
              value={settings.temperature}
              onChange={(_, value) => setSettings((prev) => ({ ...prev, temperature: value as number }))}
              min={0}
              max={1}
              step={0.1}
              marks={[
                { value: 0, label: '0' },
                { value: 0.5, label: '0.5' },
                { value: 1, label: '1' }
              ]}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Top P: {settings.top_p}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Controls diversity via nucleus sampling. Lower values make responses more focused.
            </Typography>
            <Slider
              value={settings.top_p}
              onChange={(_, value) => setSettings((prev) => ({ ...prev, top_p: value as number }))}
              min={0}
              max={1}
              step={0.1}
              marks={[
                { value: 0, label: '0' },
                { value: 0.5, label: '0.5' },
                { value: 1, label: '1' }
              ]}
            />
          </Box>
        </CardContent>
      </MainCard>

      <MainCard sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Application Settings
          </Typography>

          <FormControlLabel control={<Switch checked={true} disabled />} label="Enable Notifications" sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            Receive notifications for project updates and team activities.
          </Typography>

          <FormControlLabel control={<Switch checked={true} disabled />} label="Auto-save Drafts" sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            Automatically save project drafts as you work.
          </Typography>
        </CardContent>
      </MainCard>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={loadSettings} disabled={isSaving}>
          Reset to Defaults
        </Button>
        <Button variant="contained" onClick={saveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
}
