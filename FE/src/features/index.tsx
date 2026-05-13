import { Toaster } from '@/components/ui/sonner';
import { router } from '@/features/router';
import { RouterProvider } from 'react-router-dom';

export function Features() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
