'use client';

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
  LinearProgress,
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
  onItemToggle: (itemId: string, selected: boolean) => void;
}

export default function ExtractReviewList({
  items,
  onItemToggle,
}: ExtractReviewListProps) {
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

  const groupedItems = items.reduce((acc, item) => {
    const category = item.label;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ExtractedItem[]>);

  return (
    <Box>
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category} sx={{ mb: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {category}
                </Typography>
                <Chip
                  label={`${categoryItems.length} items`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
                <Chip
                  label={`${categoryItems.filter(item => item.selected).length} selected`}
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
                        <Checkbox
                          checked={item.selected}
                          onChange={(e) => onItemToggle(item.id, e.target.checked)}
                          color="primary"
                        />
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {item.value}
                            </Typography>
                            <Chip
                              label={getConfidenceLabel(item.confidence)}
                              size="small"
                              color={getConfidenceColor(item.confidence) as any}
                              variant="outlined"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Confidence: {Math.round(item.confidence * 100)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={item.confidence * 100}
                              color={getConfidenceColor(item.confidence) as any}
                              sx={{ width: 100, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          
                          {item.source_document_id && (
                            <Typography variant="caption" color="text.secondary">
                              Source: Document {item.source_document_id}
                            </Typography>
                          )}
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
      
      {items.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Items to Review
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No information was extracted from your project idea and documents.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
