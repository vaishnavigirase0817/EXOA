import { navigationEngine } from './NavigationEngine';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
export type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private listeners: Set<MessageHandler> = new Set();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private reconnectTimeout: number | null = null;
  private url: string = '';

  constructor() {
    // Generate URL based on protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}/ws/navigation`;
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.socket) {
      this.disconnect();
    }

    this.setStatus('connecting');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.setStatus('connected');
        console.log('EXOA WebSocket connected successfully.');
      };

      this.socket.onclose = () => {
        this.setStatus('disconnected');
        console.log('EXOA WebSocket disconnected.');
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('EXOA WebSocket error:', error);
        this.setStatus('disconnected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
    } catch (e) {
      console.error('Failed to establish WebSocket connection:', e);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.onclose = null; // Prevent reconnect loop
      this.socket.close();
      this.socket = null;
    }

    this.setStatus('disconnected');
  }

  /**
   * Schedule automatic reconnection
   */
  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      console.log('Attempting to reconnect to EXOA WebSocket...');
      this.connect();
    }, 5000);
  }

  /**
   * Update and notify connection status changes
   */
  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  /**
   * Retrieve active connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Register listener for raw messages
   */
  addListener(handler: MessageHandler) {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  /**
   * Register listener for connection status changes
   */
  addStatusListener(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.add(listener);
    // Emit current state immediately
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Process updates and apply actions to the navigation engine
   */
  private handleIncomingMessage(data: any) {
    if (data.type === 'edge_blocked') {
      console.log(`WebSocket Update: Edge blocked from ${data.from} to ${data.to}`);
      navigationEngine.blockEdge(data.from, data.to);
    } else if (data.type === 'edge_unblocked') {
      console.log(`WebSocket Update: Edge unblocked from ${data.from} to ${data.to}`);
      navigationEngine.unblockEdge(data.from, data.to);
    }

    // Broadcast to dashboard/hooks for recalculations
    this.listeners.forEach((listener) => listener(data));
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
