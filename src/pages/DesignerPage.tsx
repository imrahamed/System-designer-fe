import { useCallback, useEffect, useState } from 'react';
import { Tldraw, useEditor, createShapeId, getSnapshot, TLStore, createTLStore, loadSnapshot, TLEditorComponents } from 'tldraw';
import 'tldraw/tldraw.css';
import { useCanvasStore } from '../store/canvasStore';
import { ComponentPalette } from '@/components/ComponentPalette';
import { RightSidebar } from '@/components/RightSidebar';
import { useAutoSave } from '@/hooks/useAutoSave';

// This component will handle the state synchronization between Tldraw and Zustand.
const StateManager = () => {
    const editor = useEditor();
    const { setExcalidrawElements, setSelectedComponentId } = useCanvasStore();

    useEffect(() => {
        // Listen for changes in the Tldraw store and update the Zustand store.
        const unsubscribe = editor.store.listen(
            (entry) => {
                // Only listen to changes made by the user to prevent feedback loops.
                if (entry.source === 'user') {
                    const snapshot = getSnapshot(editor.store);
                    const shapes = Object.values(snapshot.store).filter((r: any) => r.typeName === 'shape');
                    setExcalidrawElements(shapes as any);

                    const selectedShapeIds = editor.getSelectedShapeIds();
                    if (selectedShapeIds.length > 0) {
                        setSelectedComponentId(selectedShapeIds[0]);
                    } else {
                        setSelectedComponentId(null);
                    }
                }
            },
            { scope: 'document', source: 'user' }
        );

        return () => {
            unsubscribe();
        };
    }, [editor, setExcalidrawElements, setSelectedComponentId]);

    return null;
};

// This component will handle dropping components from the palette onto the canvas.
const DropHandler = () => {
    const editor = useEditor();
    const { componentLibrary } = useCanvasStore();

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const componentId = event.dataTransfer.getData('application/my-app-component');
            if (!componentId) return;

            const component = componentLibrary.find((c) => c.id === componentId);
            if (!component) return;

            const point = editor.screenToPage({ x: event.clientX, y: event.clientY });

            editor.createShape({
                id: createShapeId(),
                type: 'geo',
                x: point.x,
                y: point.y,
                props: {
                    w: 200,
                    h: 60,
                    text: component.name,
                    geo: 'rectangle',
                },
            });
        },
        [editor, componentLibrary]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
    }, []);

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
        />
    );
};

const components: TLEditorComponents = {
    InFrontOfTheCanvas: DropHandler,
};

function DesignerPage() {
  useAutoSave();

  const [store] = useState(() => {
    const newStore = createTLStore();
    const initialSnapshot = { store: useCanvasStore.getState().excalidrawElements as any };
    if (initialSnapshot.store && Object.keys(initialSnapshot.store).length > 0) {
        loadSnapshot(newStore, initialSnapshot);
    }
    return newStore;
  });

  return (
    <div className="flex h-full w-full" data-testid="designer-page">
      <ComponentPalette />
      <div className="flex-grow h-full" style={{ position: 'relative' }}>
        <Tldraw store={store} components={components}>
            <StateManager />
        </Tldraw>
      </div>
      <RightSidebar />
    </div>
  );
}

export default DesignerPage;
