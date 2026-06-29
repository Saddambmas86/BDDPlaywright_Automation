import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { TestRunRequest, TestRunStatus, ExecutionHistoryItem } from '../../../shared/types';

interface ExecutionContextType {
  status: TestRunStatus;
  queue: TestRunRequest[];
  logs: string;
  clearLogs: () => void;
  runTest: (req: TestRunRequest) => Promise<boolean>;
  stopTest: () => Promise<boolean>;
  isConnected: boolean;
  currentUser: { name: string; role: 'Admin' | 'QA' | 'Viewer' } | null;
  login: (username: string, role: 'Admin' | 'QA' | 'Viewer') => void;
  logout: () => void;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export const useExecution = () => {
  const context = useContext(ExecutionContext);
  if (!context) {
    throw new Error('useExecution must be used within an ExecutionProvider');
  }
  return context;
};

export const ExecutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<TestRunStatus>({ status: 'idle', progress: 0, completedScenarios: 0, totalScenarios: 0 });
  const [queue, setQueue] = useState<TestRunRequest[]>([]);
  const [logs, setLogs] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: 'Admin' | 'QA' | 'Viewer' } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const connectionIdRef = useRef<number>(0);

  // Load session auth
  useEffect(() => {
    const savedUser = sessionStorage.getItem('dashboard_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // Default auto-login as QA for convenience if they open it
      const defaultUser = { name: 'Automation Lead', role: 'Admin' as const };
      sessionStorage.setItem('dashboard_user', JSON.stringify(defaultUser));
      setCurrentUser(defaultUser);
    }
  }, []);

  const login = (name: string, role: 'Admin' | 'QA' | 'Viewer') => {
    const user = { name, role };
    sessionStorage.setItem('dashboard_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    sessionStorage.removeItem('dashboard_user');
    setCurrentUser(null);
  };

  const clearLogs = () => {
    setLogs('');
  };

  // Deduplicate logs to prevent duplicate messages
  const lastLogRef = useRef<string>('');
  const logHistoryRef = useRef<Set<string>>(new Set());

  // Setup WebSocket connection
  useEffect(() => {
    const connectWS = () => {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current) {
        console.log('Connection already in progress, skipping...');
        return;
      }
      
      // Close existing connection if any
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        console.log('Closing existing WebSocket connection');
        wsRef.current.close();
        // Wait a bit for the connection to fully close
        setTimeout(() => {
          establishConnection(++connectionIdRef.current);
        }, 100);
        return;
      }
      
      establishConnection(++connectionIdRef.current);
    };
    
    const establishConnection = (connectionId: number) => {
      const loc = window.location;
      const wsProto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      // In dev mode, Vite runs on port 3000 but backend is on 3001
      const wsPort = loc.port === '3000' ? '3001' : loc.port;
      const wsUrl = `${wsProto}//${loc.hostname}:${wsPort}`;

      console.log(`[Connection ${connectionId}] Connecting to WebSocket:`, wsUrl);
      isConnectingRef.current = true;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[Connection ${connectionId}] WebSocket Connected`);
        isConnectingRef.current = false;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'status_update') {
            setStatus(message.status);
            
            // Trigger desktop notification when test starts/finishes
            if (message.status.status === 'running' && status.status !== 'running') {
              triggerDesktopAlert('Test Execution Started', `Running test suite: ${message.status.runId}`);
            }
          } else if (message.type === 'queue_update') {
            setQueue(message.queue);
          } else if (message.type === 'log') {
            // Deduplicate: only append if we haven't seen this exact message recently
            const trimmedMessage = message.data.trim();
            
            if (trimmedMessage && !logHistoryRef.current.has(trimmedMessage)) {
              // Add to history and keep only last 10 messages to prevent memory bloat
              logHistoryRef.current.add(trimmedMessage);
              if (logHistoryRef.current.size > 10) {
                const first = logHistoryRef.current.values().next().value;
                if (first) logHistoryRef.current.delete(first);
              }
              
              lastLogRef.current = message.data;
              setLogs((prev) => prev + message.data);
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log(`[Connection ${connectionId}] WebSocket Disconnected, retrying in 3s...`);
        isConnectingRef.current = false;
        setIsConnected(false);
        // Only reconnect if this is still the latest connection
        if (connectionId === connectionIdRef.current) {
          setTimeout(connectWS, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); // Empty dependency array - connect only once on mount

  const triggerDesktopAlert = (title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '🎭' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '🎭' });
        }
      });
    }
  };

  const runTest = async (req: TestRunRequest): Promise<boolean> => {
    try {
      const response = await axios.post('/api/execute', req);
      return response.data.success;
    } catch (err) {
      console.error('Failed to trigger execution:', err);
      return false;
    }
  };

  const stopTest = async (): Promise<boolean> => {
    try {
      const response = await axios.post('/api/stop');
      return response.data.success;
    } catch (err) {
      console.error('Failed to stop execution:', err);
      return false;
    }
  };

  return (
    <ExecutionContext.Provider value={{
      status,
      queue,
      logs,
      clearLogs,
      runTest,
      stopTest,
      isConnected,
      currentUser,
      login,
      logout
    }}>
      {children}
    </ExecutionContext.Provider>
  );
};