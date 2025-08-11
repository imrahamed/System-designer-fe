import { io, Socket } from 'socket.io-client';
import type { EdgeChange, NodeChange } from 'reactflow';
import type { CursorData } from '@/store/canvasStore';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

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
    const { useCanvasStore } = await import('@/store/canvasStore');

    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
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
