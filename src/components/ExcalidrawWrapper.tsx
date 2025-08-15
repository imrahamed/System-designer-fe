import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import React, { useCallback } from 'react';
import { systemDesign } from '../lib/system-design';

const ExcalidrawWrapper: React.FC = () => {
  const handleApiReady = useCallback(async (api: any) => {
    try {
      api.updateLibrary(systemDesign); // <-- Corrected line
    } catch (error) {
      console.error('Failed to load local Excalidraw library:', error);
    }
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <Excalidraw excalidrawAPI={handleApiReady} />
    </div>
  );
};

export default ExcalidrawWrapper;
