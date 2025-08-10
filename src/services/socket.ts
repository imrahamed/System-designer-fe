import { io, Socket } from 'socket.io-client';
import type { EdgeChange, NodeChange } from 'reactflow';
import type { CursorData } from '@/store/canvasStore';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(SOCKET_URL, {
      autoConnect: false,
    });
    this.setupEventListeners();
  }

  public connect() {
    this.socket.connect();
  }

  public disconnect() {
    this.socket.disconnect();
  }

  // --- Emitters ---
  public emitNodeChanges(changes: NodeChange[]) {
    this.socket.emit('node_changes', changes);
  }

  public emitEdgeChanges(changes: EdgeChange[]) {
    this.socket.emit('edge_changes', changes);
  }

  public emitCursorPosition(position: { x: number; y: number }) {
    this.socket.emit('cursor_position', position);
  }

  // --- Listeners ---
  public onNodeChanges(callback: (changes: NodeChange[]) => void) {
    this.socket.on('node_changes', callback);
  }

  public onEdgeChanges(callback: (changes: EdgeChange[]) => void) {
    this.socket.on('edge_changes', callback);
  }

  public onCursorPositionUpdate(callback: (cursorData: CursorData) => void) {
    this.socket.on('cursor_position_update', callback);
  }

  public onUserDisconnect(callback: (userId: string) => void) {
    this.socket.on('user_disconnected', callback);
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }
}

export const socketService = new SocketService();
