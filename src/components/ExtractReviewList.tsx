'use client';

import { memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import { ExpandMore, CheckCircle, Info } from '@mui/icons-material';

interface ExtractedItem {
  id: string;
  label: string;
  value: string;
  confidence: number;
  selected: boolean;
  source_document_id?: string;
}

interface ExtractReviewListProps {
  items: ExtractedItem[];
  onItemToggle: (itemId: string) => void;
  onSave?: () => void;
}

const ExtractReviewList = memo(function ExtractReviewList({ items, onItemToggle, onSave }: ExtractReviewListProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const groupedItems = items.reduce(
    (acc, item) => {
      const category = item.label;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, ExtractedItem[]>
  );

  const selectedCount = items.filter((item) => item.selected).length;
  const totalCount = items.length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Extracted Items ({selectedCount}/{totalCount} selected)
        </Typography>
        {onSave && <Chip label="Save Selections" color="primary" onClick={onSave} clickable />}
      </Box>

      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category} sx={{ mb: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {category}
                </Typography>
                <Chip label={`${categoryItems.length} items`} size="small" color="primary" variant="outlined" sx={{ mr: 2 }} />
                <Chip
                  label={`${categoryItems.filter((item) => item.selected).length} selected`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {categoryItems.map((item) => (
                  <Card key={item.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Checkbox checked={item.selected} onChange={() => onItemToggle(item.id)} color="primary" />

                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {item.value}
                            </Typography>
                            <Chip
                              label={getConfidenceLabel(item.confidence)}
                              size="small"
                              color={getConfidenceColor(item.confidence)}
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Info fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Confidence: {(item.confidence * 100).toFixed(1)}%
                            </Typography>
                          </Box>

                          <LinearProgress
                            variant="determinate"
                            value={item.confidence * 100}
                            color={getConfidenceColor(item.confidence)}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Card>
      ))}
    </Box>
  );
});

export default ExtractReviewList;
