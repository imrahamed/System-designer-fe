import { useEffect } from 'react';
import DesignerPageWrapper from './pages/DesignerPage';
import { useCanvasStore } from './store/canvasStore';
import type { CursorData } from './store/canvasStore';
import type { EdgeChange, NodeChange } from 'reactflow';
import { socketService } from './services/socket';
import { MainLayout } from './components/MainLayout';

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
    <MainLayout>
      <DesignerPageWrapper />
    </MainLayout>
  );
}

export default App;
