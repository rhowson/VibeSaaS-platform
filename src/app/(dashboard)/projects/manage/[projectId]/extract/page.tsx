'use client';

import { useState, useEffect, memo, Suspense, lazy } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';

// Lazy load heavy components
const LazyExtractReviewList = lazy(() => import('@/components/ExtractReviewList'));

interface ExtractedItem {
  id: string;
  label: string;
  value: string;
  confidence: number;
  selected: boolean;
  source_document_id?: string;
}

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const ExtractReview = memo(function ExtractReview() {
  const params = useParams();
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
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
        setError(err instanceof Error ? err.message : 'Extraction failed');
        setIsExtracting(false);
      }
    };

    poll();
  };

  const handleItemToggle = (itemId: string) => {
    setExtractedItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, selected: !item.selected } : item)));
  };

  const handleSaveSelections = async () => {
    const selectedItems = extractedItems.filter((item) => item.selected);
    // TODO: Implement save functionality
    console.log('Selected items:', selectedItems);
  };

  if (isLoading) {
    return (
      <MainCard>
        <ComponentHeader title="AI Extraction Review" />
        <LoadingSpinner />
      </MainCard>
    );
  }

  return (
    <MainCard>
      <ComponentHeader title="AI Extraction Review" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isExtracting && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CircularProgress size={20} />
          <Typography>AI is extracting information from your documents...</Typography>
        </Box>
      )}

      {extractedItems.length > 0 && (
        <Suspense fallback={<LoadingSpinner />}>
          <LazyExtractReviewList items={extractedItems} onItemToggle={handleItemToggle} onSave={handleSaveSelections} />
        </Suspense>
      )}

      {!isExtracting && extractedItems.length === 0 && !error && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No extracted items found
          </Typography>
          <Button variant="contained" onClick={startExtraction} disabled={isExtracting}>
            Start AI Extraction
          </Button>
        </Box>
      )}
    </MainCard>
  );
});

export default ExtractReview;
