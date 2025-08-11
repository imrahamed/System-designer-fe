import { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export function useAutoSave() {
  const { excalidrawElements, saveDesign, isSaving } = useCanvasStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't autosave if a save is already in progress
    if (isSaving) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Auto-saving design...');
      saveDesign();
    }, AUTOSAVE_INTERVAL);

    // Cleanup function to clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [excalidrawElements, saveDesign, isSaving]); // Rerun effect when design changes
}
