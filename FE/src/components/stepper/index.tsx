import { useStepperContext } from '@/components/stepper/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { Activity, ComponentProps } from 'react';
export { StepperProvider } from '@/components/stepper/provider';

export type StepperProps = {
  className?: string;
};

export function Stepper({ className }: StepperProps) {
  return (
    <div data-slot='stepper' className={cn('space-y-4', className)}>
      <StepperIndicators />
      <StepperContents />
    </div>
  );
}

export function StepperIndicators() {
  const { steps } = useStepperContext();

  return (
    <Card>
      <CardContent className='flex justify-between items-start'>
        {steps.map((step, index) => (
          <StepperIndicator key={step.title} index={index} />
        ))}
      </CardContent>
    </Card>
  );
}

export type StepperContentProps = {
  index?: number;
};

export function StepperIndicator({ index = 0 }: StepperContentProps) {
  const { steps, position } = useStepperContext();

  const step = steps[index ?? 0];
  const isActive = index + 1 === position;
  const isPassed = index + 1 < position;

  return (
    <div className='flex flex-col gap-2 justify-center items-center flex-1'>
      <div className='w-full flex items-center justify-center relative'>
        <div
          className={cn(
            'h-1 bg-accent w-full',
            index + 1 <= position && 'bg-primary',
            index + 1 === 1 && 'bg-transparent'
          )}
        />
        <div
          className={cn(
            'size-10 min-w-10 flex items-center justify-center rounded-full bg-secondary text-foreground font-semibold',
            (isActive || isPassed) && 'bg-primary text-background'
          )}
        >
          {isPassed ? <CheckIcon /> : index + 1}
        </div>
        <div
          className={cn(
            'h-1 bg-accent w-full',
            index + 1 < position && 'bg-primary',
            index + 1 === steps.length && 'bg-transparent'
          )}
        />
      </div>
      <div className='font-medium text-sm text-center hidden md:block'>
        {step.title}
      </div>
    </div>
  );
}

export function StepperContents() {
  const { steps, position } = useStepperContext();

  return (
    <>
      {steps.map((step, index) => {
        return (
          <Activity
            key={step.title}
            mode={position === index + 1 ? 'visible' : 'hidden'}
          >
            <Card className='gap-4 m-0 bg-transparent border-none shadow-none ring-0'>
              <CardHeader className='px-0'>
                <CardTitle className='text-2xl font-semibold leading-none tracking-tight'>
                  {step?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='px-0.5'>{step?.content}</CardContent>
            </Card>
          </Activity>
        );
      })}
    </>
  );
}

export function StepperNext({
  children,
  disabled,
  onClick,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  const { isLast, next } = useStepperContext();

  return (
    <Button
      type={type}
      variant={'default'}
      size={'lg'}
      disabled={disabled === false ? false : isLast || disabled}
      onClick={onclick ? onClick : next}
      className={cn('min-w-24', className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function StepperPrev({
  children,
  disabled,
  onClick,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  const { isFirst, prev } = useStepperContext();

  const isDisabled = disabled === false ? false : isFirst || disabled;

  return (
    <Button
      type={type}
      variant={'outline'}
      size={'lg'}
      disabled={isDisabled}
      onClick={(e) => {
        prev();
        onClick?.(e);
      }}
      className={cn('min-w-24', className)}
      {...props}
    >
      {children}
    </Button>
  );
}
