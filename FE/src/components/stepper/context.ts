import { Step } from '@/components/stepper/type';
import { createContext, useContext } from 'react';

export type StepperContextValue = {
  position: number;
  isFirst: boolean;
  isLast: boolean;
  steps: Step[];
  step: Step;
  setPosition: (position: number) => void;
  next: () => void;
  prev: () => void;
};

export const StepperContext = createContext<StepperContextValue | undefined>(
  undefined
);

export const useStepperContext = () => {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error('useStepperContext must be used within a StepperProvider');
  }

  return context;
};
