import { useRef, useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
} from 'reactflow';
import { useCanvasStore } from '../store/canvasStore';
import { ComponentPalette } from '@/components/ComponentPalette';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { TopBar } from '@/components/TopBar';
import { OtherCursors } from '@/components/OtherCursors';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useThrottle } from '@/hooks/useThrottle';
import { socketService } from '@/services/socket';
import { ContextMenu } from '@/components/ContextMenu';
import CustomNode from '@/components/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

let id = 4; // Start IDs after initial nodes
const getId = () => `${id++}`;

function DesignerPage() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    componentLibrary,
    setNodeEditing,
  } = useCanvasStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);

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

      const component = componentLibrary.find((c) => c.id === typeId);
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
          // The component model from the API doesn't have `defaultProps`.
          // We'll use the `props` field, which should contain the defaults from the backend.
          props: { ...component.props },
        },
      };
      addNode(newNode);
    },
    [project, addNode, componentLibrary]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current!.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY - bounds.top,
        left: event.clientX - bounds.left,
      });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  return (
    <div className="flex h-full w-full">
      <ComponentPalette />
      <div className="flex-grow h-full relative" ref={reactFlowWrapper} onClick={onPaneClick}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onPaneMouseMove={onPaneMouseMove}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <OtherCursors />
        </ReactFlow>
        <TopBar />
        {menu && (
          <ContextMenu
            top={menu.top}
            left={menu.left}
            onClose={() => setMenu(null)}
            onEdit={() => {
              if (menu) {
                setNodeEditing(menu.id, true);
              }
            }}
          />
        )}
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
