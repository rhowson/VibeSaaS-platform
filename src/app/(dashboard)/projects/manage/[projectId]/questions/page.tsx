'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Card, CardContent, TextField, Stepper, Step, StepLabel } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';

interface AIQuestion {
  id: string;
  question_text: string;
  answer_text?: string;
  asked_at: string;
  answered_at?: string;
}

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<AIQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [projectId]);

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/ai/questions?projectId=${projectId}`);
      
      if (response.status === 404) {
        // No questions generated yet, start the process
        await generateNextQuestion();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }

      const questionsData = await response.json();
      setQuestions(questionsData);
      
      // Find the first unanswered question
      const unanswered = questionsData.find((q: AIQuestion) => !q.answer_text);
      setCurrentQuestion(unanswered || null);
      setActiveStep(questionsData.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextQuestion = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/ai/questions/next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (response.status === 204) {
        // No more questions needed
        setActiveStep(questions.length);
        setIsGenerating(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate next question');
      }

      const question = await response.json();
      setCurrentQuestion(question);
      setQuestions(prev => [...prev, question]);
      setActiveStep(questions.length + 1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate question');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/ai/questions/${currentQuestion.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: answer.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      // Update the question in the list
      setQuestions(prev => 
        prev.map(q => 
          q.id === currentQuestion.id 
            ? { ...q, answer_text: answer.trim(), answered_at: new Date().toISOString() }
            : q
        )
      );

      setAnswer('');
      setCurrentQuestion(null);
      
      // Generate next question
      setTimeout(() => {
        generateNextQuestion();
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!currentQuestion) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/ai/questions/${currentQuestion.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: '[SKIPPED]' }),
      });

      if (!response.ok) {
        throw new Error('Failed to skip question');
      }

      // Update the question in the list
      setQuestions(prev => 
        prev.map(q => 
          q.id === currentQuestion.id 
            ? { ...q, answer_text: '[SKIPPED]', answered_at: new Date().toISOString() }
            : q
        )
      );

      setAnswer('');
      setCurrentQuestion(null);
      
      // Generate next question
      setTimeout(() => {
        generateNextQuestion();
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.push(`/projects/manage/${projectId}/plan`);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <ComponentHeader
          title="Loading Questions"
          description="Preparing AI-generated questions based on your project"
        />
        
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Loading Questions...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Preparing contextual questions to better understand your project requirements.
            </Typography>
          </Box>
        </MainCard>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ComponentHeader
        title="AI Follow-up Questions"
        description="Answer questions to help AI create a better project plan"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <MainCard sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {questions.map((question, index) => (
              <Step key={question.id}>
                <StepLabel>
                  Question {index + 1}
                </StepLabel>
              </Step>
            ))}
            <Step>
              <StepLabel>Complete</StepLabel>
            </Step>
          </Stepper>
        </CardContent>
      </MainCard>

      {isGenerating && (
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Generating Next Question...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AI is analyzing your previous answers to generate the next relevant question.
            </Typography>
          </Box>
        </MainCard>
      )}

      {currentQuestion && !isGenerating && (
        <MainCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Question {questions.length}:
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              {currentQuestion.question_text}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Your Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a detailed answer to help AI understand your project better..."
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Skip Question
              </Button>
              <Button
                variant="contained"
                onClick={submitAnswer}
                disabled={isSubmitting || !answer.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </Box>
          </CardContent>
        </MainCard>
      )}

      {!currentQuestion && !isGenerating && questions.length > 0 && (
        <MainCard>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Questions Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You've answered all the AI-generated questions. We now have enough information to create your project plan.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/projects/manage/${projectId}`)}
              >
                Back to Project
              </Button>
              <Button
                variant="contained"
                onClick={handleContinue}
              >
                Generate Project Plan
              </Button>
            </Box>
          </Box>
        </MainCard>
      )}

      {questions.length > 0 && (
        <MainCard sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Previous Questions & Answers
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {questions.map((question, index) => (
                <Card key={question.id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Question {index + 1}:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {question.question_text}
                    </Typography>
                    
                    {question.answer_text && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Your Answer:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {question.answer_text === '[SKIPPED]' ? (
                            <em>This question was skipped</em>
                          ) : (
                            question.answer_text
                          )}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </MainCard>
      )}
    </Box>
  );
}
