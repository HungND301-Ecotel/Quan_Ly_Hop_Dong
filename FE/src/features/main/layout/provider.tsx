import { PropsWithChildren, ReactNode, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MainLayoutContext } from './context';

export function MainLayoutProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<{ action: ReactNode; path: string }>();
  const location = useLocation();

  const setAction = useCallback(
    (action: ReactNode | undefined) => {
      setState({ action, path: location.pathname });
    },
    [location.pathname]
  );

  const activeAction =
    state?.path === location.pathname ? state.action : undefined;

  return (
    <MainLayoutContext.Provider value={{ action: activeAction, setAction }}>
      {children}
    </MainLayoutContext.Provider>
  );
}
