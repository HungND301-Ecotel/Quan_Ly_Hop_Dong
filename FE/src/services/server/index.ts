import { API } from '@/constants/api';
import { api } from '@/lib/api';

// Types
export interface DatabaseConnection {
  server: string;
  port: number;
  database: string;
  userId: string;
  password: string;
  trustServerCertificate: boolean;
  commandTimeoutSeconds: number;
}

export interface ExternalSyncConnection {
  id?: string;
  connection: DatabaseConnection;
  isActive: boolean;
}

export interface ExternalSyncConnectionResponse {
  success: boolean;
  message: string;
  result: string;
}

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors: Record<string, string[]>;
}

// Service functions
function listConnections(search?: string) {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }

  const url = params.toString()
    ? `${API.EXTERNAL_SYNC_CONNECTIONS.LIST}?${params.toString()}`
    : API.EXTERNAL_SYNC_CONNECTIONS.LIST;

  return api.get<ExternalSyncConnection[], void>(url);
}

function getConnectionDetail(id: string) {
  return api.get<ExternalSyncConnection, void>(
    API.EXTERNAL_SYNC_CONNECTIONS.DETAIL(id)
  );
}

function createConnection(data: Omit<ExternalSyncConnection, 'id'>) {
  return api.post<ExternalSyncConnectionResponse, typeof data>(
    API.EXTERNAL_SYNC_CONNECTIONS.CREATE,
    data
  );
}

function updateConnection(id: string, data: Omit<ExternalSyncConnection, 'id'>) {
  const payload: ExternalSyncConnection = {
    id,
    ...data,
  };

  return api.put<ExternalSyncConnectionResponse, ExternalSyncConnection>(
    API.EXTERNAL_SYNC_CONNECTIONS.UPDATE,
    payload
  );
}

function deleteConnections(ids: string[]) {
  return api.delete<ExternalSyncConnectionResponse, string[]>(
    API.EXTERNAL_SYNC_CONNECTIONS.DELETE,
    ids
  );
}

function deleteConnection(id: string) {
  return deleteConnections([id]);
}

// Helper function to validate connection
function validateConnection(connection: DatabaseConnection): string[] {
  const errors: string[] = [];

  if (!connection.server?.trim()) {
    errors.push('Server name is required');
  }

  if (!connection.port || connection.port <= 0 || connection.port > 65535) {
    errors.push('Valid port number is required (1-65535)');
  }

  if (!connection.database?.trim()) {
    errors.push('Database name is required');
  }

  if (!connection.userId?.trim()) {
    errors.push('User ID is required');
  }

  if (!connection.password) {
    errors.push('Password is required');
  }

  if (connection.commandTimeoutSeconds < 0) {
    errors.push('Command timeout seconds must be non-negative');
  }

  return errors;
}

export const externalSyncConnectionService = {
  listConnections,
  getConnectionDetail,
  createConnection,
  updateConnection,
  deleteConnection,
  deleteConnections,
  validateConnection,
};