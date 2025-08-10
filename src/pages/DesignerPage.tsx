import { useRef, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Node,
} from 'reactflow';
import { useCanvasStore } from '../store/canvasStore';
import { ComponentPalette } from '@/components/ComponentPalette';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { TopBar } from '@/components/TopBar';
import { OtherCursors } from '@/components/OtherCursors';
import { VersionHistory } from '@/components/VersionHistory'; // Import the new component
import { MOCK_COMPONENTS } from '@/utils/mock-components';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useThrottle } from '@/hooks/useThrottle';
import { socketService } from '@/services/socket';

let id = 4; // Start IDs after initial nodes
const getId = () => `${id++}`;

function DesignerPage() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useCanvasStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  useAutoSave();

  const throttledEmitCursor = useThrottle((position: { x: number; y: number }) => {
    socketService.emitCursorPosition(position);
  }, 50);

  const onPaneMouseMove = (event: React.MouseEvent) => {
    const bounds = reactFlowWrapper.current!.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    throttledEmitCursor(position);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const typeId = event.dataTransfer.getData('application/reactflow');
      if (typeof typeId === 'undefined' || !typeId) return;

      const component = MOCK_COMPONENTS.find(c => c.id === typeId);
      if (!component) return;

      const bounds = reactFlowWrapper.current!.getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: getId(),
        position,
        data: {
          componentId: component.id,
          label: component.name,
          props: { ...component.defaultProps },
        },
      };
      addNode(newNode);
    },
    [project, addNode]
  );

  return (
    <div className="flex h-full w-full">
      <ComponentPalette />
      <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onPaneMouseMove={onPaneMouseMove}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <OtherCursors />
        </ReactFlow>
        <TopBar />
        <VersionHistory /> {/* Add the version history slider */}
      </div>
      <PropertiesPanel />
    </div>
  );
}

import { ReactFlowProvider } from 'reactflow';

function DesignerPageWrapper() {
    return (
        <ReactFlowProvider>
            <DesignerPage />
        </ReactFlowProvider>
    )
}

export default DesignerPageWrapper;
