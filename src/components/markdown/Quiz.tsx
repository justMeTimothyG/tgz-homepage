"use client";

import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Shuffle, X, Pencil } from 'lucide-react';

type FeedbackCopy = {
  correct?: string;
  incorrect?: string;
};

type BaseQuestionInput = {
  question: string;
  explanation?: string;
  feedback?: FeedbackCopy;
};

type MultipleChoiceOptionInput =
  | string
  | {
      id?: string;
      label: string;
      value?: string;
    };

export type MultipleChoiceQuestionInput = BaseQuestionInput & {
  type: 'multiple-choice';
  options: MultipleChoiceOptionInput[];
  correctAnswer: number | string;
};

export type TrueFalseQuestionInput = BaseQuestionInput & {
  type: 'true-false';
  correctAnswer: boolean | 'true' | 'false';
  trueLabel?: string;
  falseLabel?: string;
};

export type QuizQuestionInput = MultipleChoiceQuestionInput | TrueFalseQuestionInput | FlashcardQuestionInput;

type NormalizedBase = {
  uid: string;
  question: string;
  explanation?: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
};

type NormalizedMultipleChoice = NormalizedBase & {
  type: 'multiple-choice';
  options: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  correctValue: string;
};

type NormalizedTrueFalse = NormalizedBase & {
  type: 'true-false';
  trueLabel: string;
  falseLabel: string;
  correctValue: 'true' | 'false';
};

export type FlashcardQuestionInput = BaseQuestionInput & {
  type: 'flashcard';
  answer: string;
  revealLabel?: string;
  hideLabel?: string;
};

type NormalizedFlashcard = NormalizedBase & {
  type: 'flashcard';
  answer: string;
  revealLabel: string;
  hideLabel: string;
};

type NormalizedQuestion = NormalizedMultipleChoice | NormalizedTrueFalse | NormalizedFlashcard;

type AttemptStatus = 'idle' | 'correct' | 'incorrect' | 'revealed';

type AttemptState = {
  status: AttemptStatus;
  attempts: number;
  locked: boolean;
  lastSelection?: string;
};

export interface QuizProps {
  data: QuizQuestionInput | QuizQuestionInput[];
  title?: string;
  randomizeLabel?: string;
  className?: string;
}

const defaultFeedback = {
  correct: 'Richtig! Gut gemacht.',
  incorrect: 'Das war leider nicht korrekt. Versuch es noch einmal.',
};

function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

function normaliseValue(value: string): string {
  return value.trim();
}

function normalizeMultipleChoice(question: MultipleChoiceQuestionInput, index: number): NormalizedMultipleChoice {
  const uid = `quiz-mc-${index}`;

  const options = question.options.map((option, optionIndex) => {
    if (typeof option === 'string') {
      const trimmed = normaliseValue(option);
      return {
        id: `${uid}-option-${optionIndex}`,
        label: trimmed,
        value: trimmed,
      };
    }

    const label = normaliseValue(option.label);
    const value = option.value ? normaliseValue(option.value) : label;

    return {
      id: option.id ?? `${uid}-option-${optionIndex}`,
      label,
      value,
    };
  });

  const pickFallback = (): string => {
    if (options.length === 0) {
      return '';
    }
    return options[0].value ?? '';
  };

  let correctValue = pickFallback();

  if (typeof question.correctAnswer === 'number') {
    const option = options[question.correctAnswer];
    correctValue = option ? option.value : pickFallback();
  } else {
    const needle = normaliseValue(String(question.correctAnswer));
    const direct = options.find((opt) => opt.value === needle || opt.label === needle);
    correctValue = direct ? direct.value : pickFallback();
  }

  return {
    uid,
    type: 'multiple-choice',
    question: question.question,
    explanation: question.explanation,
    feedback: {
      correct: question.feedback?.correct ?? defaultFeedback.correct,
      incorrect: question.feedback?.incorrect ?? defaultFeedback.incorrect,
    },
    options,
    correctValue,
  };
}

function normalizeTrueFalse(question: TrueFalseQuestionInput, index: number): NormalizedTrueFalse {
  const uid = `quiz-tf-${index}`;
  const trueLabel = question.trueLabel ? normaliseValue(question.trueLabel) : 'Wahr';
  const falseLabel = question.falseLabel ? normaliseValue(question.falseLabel) : 'Falsch';
  const answer = typeof question.correctAnswer === 'boolean' ? question.correctAnswer : question.correctAnswer === 'true';
  const correctValue: 'true' | 'false' = answer ? 'true' : 'false';

  return {
    uid,
    type: 'true-false',
    question: question.question,
    explanation: question.explanation,
    feedback: {
      correct: question.feedback?.correct ?? defaultFeedback.correct,
      incorrect: question.feedback?.incorrect ?? defaultFeedback.incorrect,
    },
    trueLabel,
    falseLabel,
    correctValue,
  };
}

function normalizeFlashcard(question: FlashcardQuestionInput, index: number): NormalizedFlashcard {
  const uid = `quiz-flash-${index}`;
  return {
    uid,
    type: 'flashcard',
    question: question.question,
    explanation: question.explanation,
    feedback: {
      correct: defaultFeedback.correct,
      incorrect: defaultFeedback.incorrect,
    },
    answer: question.answer,
    revealLabel: question.revealLabel ? question.revealLabel : 'Antwort anzeigen',
    hideLabel: question.hideLabel ? question.hideLabel : 'Antwort verbergen',
  };
}

function normalizeQuestions(input: QuizQuestionInput[]): NormalizedQuestion[] {
  return input.map((question, index) => {
    if (question.type === 'multiple-choice') {
      return normalizeMultipleChoice(question, index);
    }
    if (question.type === 'true-false') {
      return normalizeTrueFalse(question, index);
    }
    return normalizeFlashcard(question, index);
  });
}

function createAttemptState(questions: NormalizedQuestion[]): Record<string, AttemptState> {
  return questions.reduce<Record<string, AttemptState>>((acc, question) => {
    acc[question.uid] = {
      status: 'idle',
      attempts: 0,
      locked: false,
      lastSelection: undefined,
    };
    return acc;
  }, {});
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function useNormalizedQuestions(data: QuizQuestionInput | QuizQuestionInput[]) {
  const normalized = useMemo(() => normalizeQuestions(toArray(data)), [data]);
  const [questions, setQuestions] = useState<NormalizedQuestion[]>(normalized);
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>(() =>
    createAttemptState(normalized)
  );

  useEffect(() => {
    setQuestions(normalized);
    setAttempts(createAttemptState(normalized));
  }, [normalized]);

  const shuffleQuestions = React.useCallback(() => {
    setQuestions((prev) => {
      const shuffled = shuffle(prev);
      setAttempts(createAttemptState(shuffled));
      return shuffled;
    });
  }, []);

  return {
    questions,
    attempts,
    setAttempts,
    shuffleQuestions,
  };
}

export default function Quiz({
  data,
  title,
  randomizeLabel = 'Fragen mischen',
  className,
}: QuizProps) {
  const { questions, attempts, setAttempts, shuffleQuestions } = useNormalizedQuestions(data);

  const handleSelect = React.useCallback(
    (question: NormalizedMultipleChoice | NormalizedTrueFalse, value: string) => {
      setAttempts((prev) => {
        const existing = prev[question.uid];
        if (existing?.locked) {
          return prev;
        }
        const isCorrect = value === question.correctValue;
        const next: Record<string, AttemptState> = {
          ...prev,
          [question.uid]: {
            status: isCorrect ? 'correct' : 'incorrect',
            attempts: (existing?.attempts ?? 0) + 1,
            locked: isCorrect,
            lastSelection: value,
          },
        };
        return next;
      });
    },
    [setAttempts]
  );

  const toggleFlashcard = React.useCallback(
    (question: NormalizedFlashcard) => {
      setAttempts((prev) => {
        const existing = prev[question.uid];
        const isRevealed = existing?.status === 'revealed';
        const currentAttempts = existing?.attempts ?? 0;
        return {
          ...prev,
          [question.uid]: {
            status: isRevealed ? 'idle' : 'revealed',
            attempts: isRevealed ? currentAttempts : currentAttempts + 1,
            locked: false,
            lastSelection: undefined,
          },
        };
      });
    },
    [setAttempts]
  );

  return (
    <section className={clsx('not-prose', className)}>
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 md:p-7 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              <Pencil className="h-5 w-5" />
            </span>
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Teste dein Wissen mit kurzen formativen Prüfungen.
              </p>
            </div>
          </div>
          {questions.length > 1 && (
            <button
              type="button"
              onClick={shuffleQuestions}
              className="inline-flex items-center gap-2 self-start rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-indigo-500/30 dark:bg-gray-900/40 dark:text-indigo-300 dark:hover:bg-indigo-500/10 dark:focus-visible:ring-offset-gray-950"
            >
              <Shuffle className="h-4 w-4" />
              {randomizeLabel}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {questions.map((question) => {
            const attempt = attempts[question.uid] ?? {
              status: 'idle' as AttemptStatus,
              attempts: 0,
              locked: false,
              lastSelection: undefined,
            };

            return (
              <motion.article
                key={question.uid}
                className={clsx(
                  'relative overflow-hidden rounded-lg border border-gray-200/80 bg-gray-50 px-5 py-5 transition dark:border-gray-700/60 dark:bg-gray-900/40 md:px-6 md:py-6',
                  attempt.status === 'correct' && 'border-emerald-400/80 dark:border-emerald-400/70',
                  attempt.status === 'incorrect' && 'border-rose-300/80 dark:border-rose-400/70'
                )}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="relative z-10 flex flex-col gap-4">
                {question.type === 'flashcard' ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {question.question}
                    </h3>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => toggleFlashcard(question)}
                        className="inline-flex items-center gap-2 self-start rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-indigo-500/40 dark:bg-gray-900/40 dark:text-indigo-300 dark:hover:bg-indigo-500/10 dark:focus-visible:ring-offset-gray-950"
                      >
                        {attempt.status === 'revealed' ? question.hideLabel : question.revealLabel}
                      </button>
                    </div>
                    <AnimatePresence>
                      {attempt.status === 'revealed' && (
                        <motion.div
                          key="flashcard-answer"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="rounded-md border border-indigo-200 bg-white px-4 py-4 text-gray-800 shadow-sm dark:border-indigo-500/30 dark:bg-gray-900/50 dark:text-gray-100"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                            Antwort
                          </p>
                          <p className="mt-2 text-base font-medium">
                            {question.answer}
                          </p>
                          {question.explanation && (
                            <div className="mt-3 border-t border-indigo-100 pt-3 text-sm text-gray-600 dark:border-indigo-500/20 dark:text-gray-300">
                              {question.explanation}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : question.type === 'true-false' ? (
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {question.question}
                      </h3>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3 md:w-80">
                      {([
                        { value: 'true' as const, label: question.trueLabel },
                        { value: 'false' as const, label: question.falseLabel },
                      ] as const).map((option) => {
                        const isSelected = attempt.lastSelection === option.value;
                        const isCorrect = option.value === question.correctValue;
                        const intent =
                          attempt.status === 'correct' && isCorrect
                            ? 'success'
                            : attempt.status === 'incorrect' && isSelected
                              ? 'danger'
                              : 'idle';

                        const buttonClass = clsx(
                          'group relative flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 dark:focus-visible:ring-offset-gray-950',
                          intent === 'success' &&
                            'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-inner dark:border-emerald-400/70 dark:bg-emerald-900/30 dark:text-emerald-100',
                          intent === 'danger' &&
                            'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/80 dark:bg-rose-900/30 dark:text-rose-100',
                          intent === 'idle' &&
                            'border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200 dark:hover:border-indigo-400/70 dark:hover:bg-indigo-900/20'
                        );

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(question, option.value)}
                            disabled={attempt.locked}
                            className={buttonClass}
                            aria-pressed={isSelected}
                            animate={
                              attempt.status === 'incorrect' && isSelected
                                ? { x: [-6, 6, -4, 4, -2, 2, 0], scale: 1 }
                                : attempt.status === 'correct' && isCorrect
                                  ? { scale: [1, 1.02, 1] }
                                  : { x: 0, scale: 1 }
                            }
                            transition={
                              attempt.status === 'incorrect' && isSelected
                                ? { duration: 0.35, ease: 'easeInOut' }
                                : attempt.status === 'correct' && isCorrect
                                  ? { duration: 0.25, ease: 'easeOut' }
                                  : { duration: 0.2, ease: 'linear' }
                            }
                          >
                            <span>{option.label}</span>
                            {intent === 'success' && <Check className="h-4 w-4" />}
                            {intent === 'danger' && <X className="h-4 w-4" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {question.question}
                    </h3>
                    <div className="grid gap-3">
                      {question.options.map((option) => {
                        const isSelected = attempt.lastSelection === option.value;
                        const isCorrect = option.value === question.correctValue;
                        const isLocked = attempt.locked;
                        const stateClass = isLocked
                          ? isCorrect
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-400/70 dark:bg-emerald-900/30 dark:text-emerald-100'
                            : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200'
                          : isSelected
                            ? isCorrect
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-400/70 dark:bg-emerald-900/30 dark:text-emerald-100'
                              : 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm dark:border-rose-400/70 dark:bg-rose-900/30 dark:text-rose-100'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200 dark:hover:border-indigo-400/70 dark:hover:bg-indigo-900/20';

                        return (
                          <motion.button
                            key={option.id}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(question, option.value)}
                            disabled={isLocked}
                            className={clsx(
                              'flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75 dark:focus-visible:ring-offset-gray-950',
                              stateClass
                            )}
                            aria-pressed={isSelected}
                            animate={
                              attempt.status === 'incorrect' && isSelected
                                ? { x: [-6, 6, -4, 4, -2, 2, 0], scale: 1 }
                                : attempt.status === 'correct' && isCorrect
                                  ? { scale: [1, 1.02, 1] }
                                  : { x: 0, scale: 1 }
                            }
                            transition={
                              attempt.status === 'incorrect' && isSelected
                                ? { duration: 0.35, ease: 'easeInOut' }
                                : attempt.status === 'correct' && isCorrect
                                  ? { duration: 0.25, ease: 'easeOut' }
                                  : { duration: 0.2, ease: 'linear' }
                            }
                          >
                            <span>{option.label}</span>
                            {attempt.locked && isCorrect && <Check className="h-4 w-4" />}
                            {!attempt.locked && isSelected && !isCorrect && <X className="h-4 w-4" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}

                <AnimatePresence mode="wait">
                  {question.type !== 'flashcard' && attempt.status !== 'idle' && (
                    <motion.p
                      key={attempt.status}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={clsx(
                        'text-sm font-medium',
                        attempt.status === 'correct'
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-rose-600 dark:text-rose-300'
                      )}
                    >
                      {attempt.status === 'correct'
                        ? question.feedback.correct
                        : question.feedback.incorrect}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {question.type !== 'flashcard' && attempt.status === 'correct' && question.explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="rounded-md border border-emerald-300/70 bg-emerald-50 px-4 py-3 text-sm text-gray-700 dark:border-emerald-400/50 dark:bg-emerald-900/30 dark:text-gray-200"
                    >
                      {question.explanation}
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
