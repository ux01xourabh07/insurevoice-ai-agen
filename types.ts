export interface AudioConfig {
  sampleRate: number;
  channels: number;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

export interface PolicyDocument {
  title: string;
  content: string;
}

export interface LogMessage {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  message: string;
}

export interface StoredSession {
  id: string;
  timestamp: string; // ISO string
  logs: LogMessage[];
  policySummary?: string; // Optional short descriptor
}
