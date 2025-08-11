import { useRef, useCallback } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { ExcalidrawAPI } from '@excalidraw/excalidraw/types/types';
import { useCanvasStore } from '../store/canvasStore';
import { ComponentPalette } from '@/components/ComponentPalette';
import { RightSidebar } from '@/components/RightSidebar';
import { useAutoSave } from "@/hooks/useAutoSave";
import { nanoid } from 'nanoid';

function DesignerPage() {
  const { excalidrawElements, setExcalidrawElements, componentLibrary } = useCanvasStore();
  const excalidrawApiRef = useRef<ExcalidrawAPI>(null);

  useAutoSave();

  const handleExcalidrawChange = (elements: readonly ExcalidrawElement[]) => {
    // This will be called on every change, including programmatic changes.
    // It will also be called when the user draws on the canvas.
    // This is how we keep our store in sync with the canvas.
    setExcalidrawElements(elements);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData('application/my-app-component');
      if (!componentId) return;

      const component = componentLibrary.find((c) => c.id === componentId);
      if (!component) return;

      const api = excalidrawApiRef.current;
      if (!api) return;

      // This is a guess. The actual API might be different.
      // The goal is to convert screen coords to scene coords.
      const { x, y } = api.getSceneCoordinatesFromOffsets(event.clientX, event.clientY);

      const newElement: ExcalidrawElement = {
        id: nanoid(),
        type: 'rectangle',
        x,
        y,
        width: 200,
        height: 60,
        label: {
          text: component.name,
          fontSize: 20,
          verticalAlign: "middle",
          textAlign: "center"
        },
        customData: {
            componentId: component.id,
        },
        // These are just some default styles.
        strokeColor: '#1e1e1e',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: {
          type: 3
        },
        seed: Math.floor(Math.random() * 10000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
      };

      api.addElements([newElement]);
    },
    [componentLibrary]
  );

  return (
    <div className="flex h-full w-full">
      <ComponentPalette />
      <div
        className="flex-grow h-full"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Excalidraw
          ref={excalidrawApiRef}
          initialData={{
            elements: excalidrawElements,
          }}
          onChange={handleExcalidrawChange}
          onPointerUpdate={(payload) => {
            const selectedElementIds = Object.keys(payload.appState.selectedElementIds);
            if (selectedElementIds.length > 0) {
              // For now, just take the first selected element.
              useCanvasStore.getState().setSelectedComponentId(selectedElementIds[0]);
            } else {
              useCanvasStore.getState().setSelectedComponentId(null);
            }
          }}
        />
      </div>
      <RightSidebar />
    </div>
  );
}

export default DesignerPage;
