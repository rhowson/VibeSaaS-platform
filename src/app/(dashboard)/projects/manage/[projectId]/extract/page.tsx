'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, Checkbox, FormControlLabel, Chip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';
import ExtractReviewList from '@/components/ExtractReviewList';

interface ExtractedItem {
  id: string;
  label: string;
  value: string;
  confidence: number;
  selected: boolean;
  source_document_id?: string;
}

export default function ExtractReview() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExtractedItems();
  }, [projectId]);

  const loadExtractedItems = async () => {
    try {
      const response = await fetch(`/api/ai/extract?projectId=${projectId}`);
      
      if (response.status === 404) {
        // No extraction done yet, start it
        await startExtraction();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to load extracted items');
      }

      const items = await response.json();
      setExtractedItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load extracted items');
    } finally {
      setIsLoading(false);
    }
  };

  const startExtraction = async () => {
    setIsExtracting(true);
    setError('');

    try {
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start extraction');
      }

      // Poll for results
      await pollForExtractionResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start extraction');
      setIsExtracting(false);
    }
  };

  const pollForExtractionResults = async () => {
    const maxAttempts = 30; // 30 seconds
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/ai/extract?projectId=${projectId}`);
        
        if (response.ok) {
          const items = await response.json();
          setExtractedItems(items);
          setIsExtracting(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          throw new Error('Extraction timed out');
        }
      } catch (err) {
        setError('Failed to get extraction results');
        setIsExtracting(false);
      }
    };

    poll();
  };

  const handleItemToggle = async (itemId: string, selected: boolean) => {
    try {
      const response = await fetch(`/api/ai/extract/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected }),
      });

      if (response.ok) {
        setExtractedItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, selected } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleSelectAll = async (selected: boolean) => {
    try {
      const response = await fetch(`/api/ai/extract/batch`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId,
          selected 
        }),
      });

      if (response.ok) {
        setExtractedItems(prev => 
          prev.map(item => ({ ...item, selected }))
        );
      }
    } catch (error) {
      console.error('Failed to update items:', error);
    }
  };

  const handleContinue = () => {
    const selectedItems = extractedItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      setError('Please select at least one item to continue');
      return;
    }
    
    router.push(`/projects/manage/${projectId}/questions`);
  };

  const selectedCount = extractedItems.filter(item => item.selected).length;
  const totalCount = extractedItems.length;

  if (isLoading || isExtracting) {
    return (
      <Box sx={{ p: 3 }}>
        <ComponentHeader
          title="AI Analysis in Progress"
          description="Extracting key details from your project idea and documents"
        />
        
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              {isExtracting ? 'Analyzing Your Project...' : 'Loading Results...'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isExtracting 
                ? 'Our AI is reviewing your project idea and documents to identify key requirements, constraints, and milestones.'
                : 'Loading extracted information...'
              }
            </Typography>
          </Box>
        </MainCard>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ComponentHeader
        title="Review Extracted Information"
        description="Review and select the key details that are relevant to your project"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {extractedItems.length === 0 ? (
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Information Extracted
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The AI analysis didn't find any extractable information. You can continue to the next step or restart the analysis.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={startExtraction}
                disabled={isExtracting}
              >
                Restart Analysis
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push(`/projects/manage/${projectId}/questions`)}
              >
                Continue Anyway
              </Button>
            </Box>
          </Box>
        </MainCard>
      ) : (
        <>
          <MainCard sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Extracted Items ({selectedCount}/{totalCount} selected)
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedCount === totalCount && totalCount > 0}
                      indeterminate={selectedCount > 0 && selectedCount < totalCount}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  }
                  label="Select All"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review the information extracted from your project idea and documents. 
                Check the items that are relevant to your project planning.
              </Typography>
            </CardContent>
          </MainCard>

          <ExtractReviewList
            items={extractedItems}
            onItemToggle={handleItemToggle}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/projects/manage/${projectId}`)}
            >
              Back to Project
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={selectedCount === 0}
            >
              Continue to Questions ({selectedCount} selected)
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
