import { useState, useCallback } from 'react';
import {
  externalSyncConnectionService,
  ExternalSyncConnection,
} from '@/services/server/index';

interface UseExternalSyncConnectionsState {
  connections: ExternalSyncConnection[];
  loading: boolean;
  error: string | null;
}

interface UseExternalSyncConnectionsActions {
  loadConnections: (search?: string) => Promise<void>;
  getConnection: (id: string) => Promise<ExternalSyncConnection | null>;
  createConnection: (data: Omit<ExternalSyncConnection, 'id'>) => Promise<boolean>;
  updateConnection: (id: string, data: Omit<ExternalSyncConnection, 'id'>) => Promise<boolean>;
  deleteConnection: (id: string) => Promise<boolean>;
  deleteConnections: (ids: string[]) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Custom hook for managing external sync connections
 * Provides state management and API calls for connection management
 */
export function useExternalSyncConnections(): UseExternalSyncConnectionsState &
  UseExternalSyncConnectionsActions {
  const [state, setState] = useState<UseExternalSyncConnectionsState>({
    connections: [],
    loading: false,
    error: null,
  });

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const loadConnections = useCallback(async (search?: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await externalSyncConnectionService.listConnections(search) as unknown;

      let connections: ExternalSyncConnection[] = [];

      if (Array.isArray(response)) {
        connections = response as ExternalSyncConnection[];
      } else if (response && typeof response === 'object') {
        const res = response as { result?: ExternalSyncConnection[] | string };
        if (typeof res.result === 'string') {
          connections = JSON.parse(res.result);
        } else if (Array.isArray(res.result)) {
          connections = res.result;
        }
      }

      setState((prev) => ({ ...prev, connections, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load connections';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  const getConnection = useCallback(async (id: string): Promise<ExternalSyncConnection | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await externalSyncConnectionService.getConnectionDetail(id) as unknown;

      let connection: ExternalSyncConnection | null = null;

      if (Array.isArray(response) && response.length > 0) {
        connection = response[0] as ExternalSyncConnection;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        connection = response as ExternalSyncConnection;
      }

      setState((prev) => ({ ...prev, loading: false }));
      return connection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load connection';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  }, []);

  const createConnection = useCallback(
    async (data: Omit<ExternalSyncConnection, 'id'>): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        await externalSyncConnectionService.createConnection(data);
        await loadConnections();
        setState((prev) => ({ ...prev, loading: false }));
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create connection';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return false;
      }
    },
    [loadConnections]
  );

  const updateConnection = useCallback(
    async (id: string, data: Omit<ExternalSyncConnection, 'id'>): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        await externalSyncConnectionService.updateConnection(id, data);
        await loadConnections();
        setState((prev) => ({ ...prev, loading: false }));
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update connection';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return false;
      }
    },
    [loadConnections]
  );

  const deleteConnection = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        await externalSyncConnectionService.deleteConnection(id);
        await loadConnections();
        setState((prev) => ({ ...prev, loading: false }));
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete connection';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return false;
      }
    },
    [loadConnections]
  );

  const deleteConnections = useCallback(
    async (ids: string[]): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        await externalSyncConnectionService.deleteConnections(ids);
        await loadConnections();
        setState((prev) => ({ ...prev, loading: false }));
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete connections';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return false;
      }
    },
    [loadConnections]
  );

  return {
    ...state,
    loadConnections,
    getConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    deleteConnections,
    clearError,
  };
}

/**
 * Custom hook for managing a single connection form
 */
interface UseConnectionFormState {
  formData: any;
  validationErrors: string[];
}

interface UseConnectionFormActions {
  setFormData: (data: any) => void;
  updateField: (fieldName: string, value: any) => void;
  reset: () => void;
  validate: () => boolean;
  clearErrors: () => void;
}

const defaultFormData = {
  connection: {
    server: '',
    port: 1433,
    database: '',
    userId: '',
    password: '',
    trustServerCertificate: false,
    commandTimeoutSeconds: 30,
  },
  isActive: true,
};

export function useConnectionForm(
  initialData = defaultFormData
): UseConnectionFormState & UseConnectionFormActions {
  const [formData, setFormData] = useState(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateField = useCallback((fieldName: string, value: any) => {
    setFormData((prev) => {
      if (fieldName.startsWith('connection.')) {
        const fieldKey = fieldName.replace('connection.', '');
        return {
          ...prev,
          connection: {
            ...prev.connection,
            [fieldKey]:
              fieldKey === 'port' || fieldKey === 'commandTimeoutSeconds'
                ? parseInt(value, 10)
                : value,
          },
        };
      }
      return { ...prev, [fieldName]: value };
    });
  }, []);

  const validate = useCallback((): boolean => {
    const errors = externalSyncConnectionService.validateConnection(
      formData.connection
    );
    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setValidationErrors([]);
  }, [initialData]);

  const clearErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    formData,
    validationErrors,
    setFormData,
    updateField,
    reset,
    validate,
    clearErrors,
  };
}