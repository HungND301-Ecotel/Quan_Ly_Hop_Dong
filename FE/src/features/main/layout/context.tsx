import { createContext, ReactNode, useContext } from 'react';

export type MainLayoutContextValue = {
  action?: ReactNode;
  setAction: (action: ReactNode | undefined) => void;
};

export const MainLayoutContext = createContext<MainLayoutContextValue | null>(
  null
);

export function useMainLayoutContext() {
  const context = useContext(MainLayoutContext);
  if (!context) {
    throw new Error(
      'useMainLayoutContext must be used within a MainLayoutContextProvider'
    );
  }
  return context;
}
