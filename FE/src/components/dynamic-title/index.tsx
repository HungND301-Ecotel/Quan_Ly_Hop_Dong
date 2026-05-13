import { useMeta } from '@/features/hook';

export function DynamicTitle() {
  const meta = useMeta();

  return (
    <div>
      <h1 className='text-3xl font-bold mb-1'>{meta?.title}</h1>
      <p className='text-muted-foreground'>{meta?.description}</p>
    </div>
  );
}
