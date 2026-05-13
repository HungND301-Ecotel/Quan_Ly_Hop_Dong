import { DynamicTitle } from '@/components/dynamic-title';
import { useMainLayoutContext } from '../../context';

export function MainContent() {
  const { action } = useMainLayoutContext();

  return (
    <div className='flex items-center justify-between gap-8'>
      <DynamicTitle />
      {action}
    </div>
  );
}
