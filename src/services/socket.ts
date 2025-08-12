import { io, Socket } from 'socket.io-client';
import { useCanvasStore } from '@/store/canvasStore';
import type { CursorData } from '@/store/canvasStore';

// Using any as a workaround for type import errors
type ExcalidrawElement = any;

const SOCKET_URL = 'http://localhost:3001';

class MockSocket {
  on(event: string, callback: (...args: any[]) => void) {}
  emit(event: string, ...args: any[]) {}
  connect() {}
  disconnect() {}
}

class SocketService {
  public socket: Socket | MockSocket;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
      });
    } else {
      this.socket = new MockSocket();
    }
    this.setupEventListeners();
  }

  public connect() {
    this.socket.connect();
  }

  public disconnect() {
    this.socket.disconnect();
  }

  // --- Emitters ---
  public emitSceneUpdate(elements: readonly ExcalidrawElement[]) {
    this.socket.emit('scene_update', elements);
  }

  public emitCursorPosition(position: { x: number; y: number }) {
    this.socket.emit('cursor_position', position);
  }

  // --- Listeners ---
  public onSceneUpdate(callback: (elements: readonly ExcalidrawElement[]) => void) {
    this.socket.on('scene_update', callback);
  }

  public onCursorPositionUpdate(callback: (cursorData: CursorData) => void) {
    this.socket.on('cursor_position_update', callback);
  }

  public onUserDisconnect(callback: (userId: string) => void) {
    this.socket.on('user_disconnected', callback);
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully with ID:', (this.socket as Socket).id);
    });

    this.socket.on('disconnect', (reason: any) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
    });

    this.onSceneUpdate((elements) => {
      useCanvasStore.getState().applyRemoteSceneUpdate(elements);
    });

    this.onCursorPositionUpdate((cursorData) => {
      useCanvasStore.getState().updateCursor(cursorData);
    });

    this.onUserDisconnect((userId) => {
      useCanvasStore.getState().removeCursor(userId);
    });
  }
}

export const socketService = new SocketService();
