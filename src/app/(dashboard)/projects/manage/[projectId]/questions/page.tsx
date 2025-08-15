'use client';

import { useState, useEffect, memo, Suspense, lazy } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ComponentHeader from '@/components/cards/ComponentHeader';

// Lazy load heavy components
const LazyCard = lazy(() => import('@mui/material/Card'));
const LazyCardContent = lazy(() => import('@mui/material/CardContent'));
const LazyTextField = lazy(() => import('@mui/material/TextField'));
const LazyStepper = lazy(() => import('@mui/material/Stepper'));
const LazyStep = lazy(() => import('@mui/material/Step'));
const LazyStepLabel = lazy(() => import('@mui/material/StepLabel'));

interface AIQuestion {
  id: string;
  question_text: string;
  answer_text?: string;
  asked_at: string;
  answered_at?: string;
}

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const QuestionsPage = memo(function QuestionsPage() {
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
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
      setQuestions((prev) => [...prev, question]);
      setActiveStep(questions.length + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate question');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/ai/questions/${currentQuestion.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer: answer.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      // Update the question with the answer
      setQuestions((prev) =>
        prev.map((q) => (q.id === currentQuestion.id ? { ...q, answer_text: answer.trim(), answered_at: new Date().toISOString() } : q))
      );

      setAnswer('');
      setCurrentQuestion(null);

      // Generate next question
      await generateNextQuestion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (!currentQuestion) return;

    try {
      const response = await fetch(`/api/ai/questions/${currentQuestion.id}/skip`, {
        method: 'POST'
      });

      if (response.ok) {
        setCurrentQuestion(null);
        await generateNextQuestion();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip question');
    }
  };

  const handleContinue = () => {
    router.push(`/projects/manage/${projectId}/plan`);
  };

  if (isLoading) {
    return (
      <MainCard>
        <ComponentHeader title="AI Questions" />
        <LoadingSpinner />
      </MainCard>
    );
  }

  return (
    <MainCard>
      <ComponentHeader title="AI Questions" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <LazyStepper activeStep={activeStep} sx={{ mb: 3 }}>
          {questions.map((question, index) => (
            <LazyStep key={question.id}>
              <LazyStepLabel>Question {index + 1}</LazyStepLabel>
            </LazyStep>
          ))}
        </LazyStepper>
      </Suspense>

      {isGenerating && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CircularProgress size={20} />
          <Typography>AI is generating the next question...</Typography>
        </Box>
      )}

      {currentQuestion && (
        <Suspense fallback={<LoadingSpinner />}>
          <LazyCard sx={{ mb: 3 }}>
            <LazyCardContent>
              <Typography variant="h6" gutterBottom>
                {currentQuestion.question_text}
              </Typography>

              <LazyTextField
                fullWidth
                multiline
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={2}>
                <Button variant="outlined" onClick={handleSkipQuestion} disabled={isSubmitting}>
                  Skip
                </Button>
                <Button variant="contained" onClick={submitAnswer} disabled={!answer.trim() || isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </Box>
            </LazyCardContent>
          </LazyCard>
        </Suspense>
      )}

      {questions.length > 0 && !currentQuestion && !isGenerating && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>
            All questions completed!
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            You've answered all the AI-generated questions. Ready to generate your project plan?
          </Typography>
          <Button variant="contained" onClick={handleContinue}>
            Generate Project Plan
          </Button>
        </Box>
      )}

      {questions.length === 0 && !isGenerating && !error && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No questions generated yet
          </Typography>
          <Button variant="contained" onClick={generateNextQuestion} disabled={isGenerating}>
            Start AI Questions
          </Button>
        </Box>
      )}
    </MainCard>
  );
});

export default QuestionsPage;
