import { useMatches } from 'react-router-dom';

export type Handle = {
  title?: string;
  description?: string;
};

export function useMeta() {
  const matches = useMatches();

  const match = matches.findLast((match) => match.handle);

  if (!match) return;

  return match.handle as Handle;
}
