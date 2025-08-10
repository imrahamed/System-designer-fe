import { useEffect } from 'react';
import DesignerPage from './pages/DesignerPage';
import { useCanvasStore } from './store/canvasStore';
import { Toaster } from '@/components/ui/sonner';
import type { CursorData } from './store/canvasStore';
import type { EdgeChange, NodeChange } from 'reactflow';
import { ThemeProvider } from '@/components/ThemeProvider';
import { socketService } from './services/socket';

function App() {
  const {
    fetchComponents,
    applyRemoteNodeChanges,
    applyRemoteEdgeChanges,
    updateCursor,
    removeCursor,
  } = useCanvasStore();

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  useEffect(() => {
    socketService.connect();
    socketService.onNodeChanges((changes: NodeChange[]) => applyRemoteNodeChanges(changes));
    socketService.onEdgeChanges((changes: EdgeChange[]) => applyRemoteEdgeChanges(changes));
    socketService.onCursorPositionUpdate((cursorData: CursorData) => updateCursor(cursorData));
    socketService.onUserDisconnect((userId: string) => removeCursor(userId));
    return () => socketService.disconnect();
  }, [applyRemoteNodeChanges, applyRemoteEdgeChanges, updateCursor, removeCursor]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-screen w-screen bg-background text-foreground">
        <DesignerPage />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
