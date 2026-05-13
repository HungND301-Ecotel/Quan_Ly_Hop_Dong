import {
  StepperContext,
  StepperContextValue,
} from '@/components/stepper/context';
import { Step } from '@/components/stepper/type';
import { PropsWithChildren, useState } from 'react';

export type StepperProviderProps = PropsWithChildren<{
  steps: Step[];
}>;

export function StepperProvider({ steps, children }: StepperProviderProps) {
  const [position, setPosition] = useState<number>(1);

  const step = steps[position - 1];

  const isFirst = position === 1;
  const isLast = position === steps.length;

  const next = () => {
    const max = steps.length;
    setPosition((step) => (step === max ? step : step + 1));
  };

  const prev = () => {
    const min = 1;
    setPosition((step) => (step === min ? step : step - 1));
  };

  const value: StepperContextValue = {
    steps,
    step,
    position,
    isFirst,
    isLast,
    next,
    prev,
    setPosition: (step: number) => {
      if (step < 1 || step > steps.length) return;
      setPosition(step);
    },
  };

  return (
    <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
  );
}
