import { useEffect } from 'react';
import DesignerPage from './pages/DesignerPage';
import { useCanvasStore } from './store/canvasStore';
import { socketService } from './services/socket';
import { MainLayout } from './components/MainLayout';

function App() {
  const { fetchComponents } = useCanvasStore();

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  return (
    <MainLayout>
      <DesignerPage />
    </MainLayout>
  );
}

export default App;
