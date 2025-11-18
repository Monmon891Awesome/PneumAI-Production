import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws/scans');

      ws.onopen = () => {
        console.log('✓ WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);

        ws.pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          setLastMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      if (wsRef.current.pingInterval) {
        clearInterval(wsRef.current.pingInterval);
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value = {
    isConnected,
    lastMessage,
    reconnect: connect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
