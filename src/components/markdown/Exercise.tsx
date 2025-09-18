import React, { ReactNode } from 'react';
import ExerciseClient, { ExerciseContentProps, TaskItem } from './ExerciseClient';

export interface TaskProps {
  children: ReactNode;
  variant?: 'default' | 'compact';
  [key: string]: unknown;
}

export interface SimpleSlotProps {
  children: ReactNode;
  [key: string]: unknown;
}

type SlotComponent<P> = React.FC<P> & { slotKind: 'Task' | 'Hint' | 'Step' | 'Solution' };

// Lightweight markers so the server wrapper can capture slot content
const Task: SlotComponent<TaskProps> = () => null;
Task.displayName = 'Task';
Task.slotKind = 'Task';
export { Task };

const Hint: SlotComponent<SimpleSlotProps> = () => null;
Hint.displayName = 'Hint';
Hint.slotKind = 'Hint';
export { Hint };

const Step: SlotComponent<SimpleSlotProps> = () => null;
Step.displayName = 'Step';
Step.slotKind = 'Step';
export { Step };

const Solution: SlotComponent<SimpleSlotProps> = () => null;
Solution.displayName = 'Solution';
Solution.slotKind = 'Solution';
export { Solution };

export interface ExerciseProps {
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

function isReactFragment(node: React.ReactElement): boolean {
  return node.type === React.Fragment;
}

function getSlotKind(node: React.ReactElement): 'Task' | 'Hint' | 'Step' | 'Solution' | null {
  const props = node.props as { ['data-ex-kind']?: string };
  const kindFromProp = typeof props['data-ex-kind'] === 'string' ? props['data-ex-kind'] : null;
  if (kindFromProp) return kindFromProp as 'Task' | 'Hint' | 'Step' | 'Solution';
  const type = node.type as { slotKind?: string } | undefined;
  if (type && typeof type.slotKind === 'string') {
    return type.slotKind as 'Task' | 'Hint' | 'Step' | 'Solution';
  }
  return null;
}

function toTaskItem(node: React.ReactElement, forceCompact: boolean): TaskItem {
  const props = node.props as TaskProps;
  const variant = forceCompact ? 'compact' : (props.variant ?? 'default');
  return {
    content: props.children,
    variant,
  };
}

export default function Exercise({
  title = 'Aufgabe',
  difficulty = 'medium',
  children,
  className = '',
  compact = false,
}: ExerciseProps) {
  const tasks: TaskItem[] = [];
  const hints: ReactNode[] = [];
  const steps: ReactNode[] = [];
  const solutions: ReactNode[] = [];

  const collect = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }

    if (!React.isValidElement(node)) {
      return;
    }

    const slotKind = getSlotKind(node);

    if (slotKind === 'Task') {
      tasks.push(toTaskItem(node, compact));
      return;
    }

    if (slotKind === 'Hint') {
      const props = node.props as SimpleSlotProps;
      hints.push(props.children);
      return;
    }

    if (slotKind === 'Step') {
      const props = node.props as SimpleSlotProps;
      steps.push(props.children);
      return;
    }

    if (slotKind === 'Solution') {
      const props = node.props as SimpleSlotProps;
      solutions.push(props.children);
      return;
    }

    if (isReactFragment(node)) {
      collect((node.props as { children?: ReactNode }).children ?? null);
    }
  };

  collect(children);

  const clientProps: ExerciseContentProps = {
    title,
    difficulty,
    className,
    compact,
    tasks,
    hints,
    steps,
    solutions,
  };

  return <ExerciseClient {...clientProps} />;
}
