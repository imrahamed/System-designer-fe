import { useState, useCallback, useEffect, useRef } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import { useCanvasStore } from '../store/canvasStore';
import { ComponentPalette } from '@/components/ComponentPalette';
import { RightSidebar } from '@/components/RightSidebar';
import { useAutoSave } from "@/hooks/useAutoSave";
import { nanoid } from 'nanoid';

// Using any as a workaround for type import errors
type ExcalidrawElement = any;
type AppState = any;
type ExcalidrawAPI = any;

function DesignerPage() {
  const { excalidrawElements, setExcalidrawElements, componentLibrary, setSelectedComponentId } = useCanvasStore();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);
  const excalidrawRef = useRef<ExcalidrawAPI>(null);

  useAutoSave();

  useEffect(() => {
    // @ts-ignore
    if (excalidrawRef.current) {
        // @ts-ignore
        setExcalidrawAPI(excalidrawRef.current);
    }
  }, []);

  useEffect(() => {
    if (excalidrawAPI) {
      const sceneElements = excalidrawAPI.getSceneElements();
      // Using JSON.stringify for deep comparison to avoid external dependencies.
      if (JSON.stringify(sceneElements) !== JSON.stringify(excalidrawElements)) {
        excalidrawAPI.updateScene({ elements: excalidrawElements });
      }
    }
  }, [excalidrawElements, excalidrawAPI]);

  const handleExcalidrawChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState
  ) => {
    // To prevent feedback loop, we can compare the incoming elements
    // with the ones in the store.
    if (JSON.stringify(elements) !== JSON.stringify(useCanvasStore.getState().excalidrawElements)) {
        setExcalidrawElements(elements);
    }

    const selectedElementIds = Object.keys(appState.selectedElementIds);
    if (selectedElementIds.length > 0) {
      setSelectedComponentId(selectedElementIds[0]);
    } else {
      setSelectedComponentId(null);
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!excalidrawAPI) return;
      const componentId = event.dataTransfer.getData('application/my-app-component');
      if (!componentId) return;

      const component = componentLibrary.find((c) => c.id === componentId);
      if (!component) return;

      const { x, y } = excalidrawAPI.getSceneCoordinates({
        clientX: event.clientX,
        clientY: event.clientY,
      });

      const newElement: ExcalidrawElement = {
        id: nanoid(),
        type: 'rectangle',
        x,
        y,
        width: 200,
        height: 60,
        customData: {
          componentId: component.id,
          props: { ...component.props },
        },
        label: {
          text: component.name,
          fontSize: 20,
          verticalAlign: "middle",
          textAlign: "center"
        },
        strokeColor: '#1e1e1e',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 3 },
        seed: Math.floor(Math.random() * 10000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
      };

      excalidrawAPI.addElements([newElement]);
    },
    [componentLibrary, excalidrawAPI]
  );

  return (
    <div className="flex h-full w-full" data-testid="designer-page">
      <ComponentPalette />
      <div
        className="flex-grow h-full"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Excalidraw
          ref={excalidrawRef as any}
          initialData={{
            elements: useCanvasStore.getState().excalidrawElements,
          }}
          onChange={handleExcalidrawChange}
        />
      </div>
      <RightSidebar />
    </div>
  );
}

export default DesignerPage;
