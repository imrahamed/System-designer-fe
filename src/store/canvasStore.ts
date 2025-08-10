import { create } from 'zustand';
import { temporal } from 'zundo';
import type { TemporalState } from 'zundo';
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import type { ComponentData } from '@/utils/mock-components';
import { socketService } from '@/services/socket';

export interface CursorData {
  userId: string;
  x: number;
  y: number;
  name?: string;
}

interface TemporalCanvasState {
  nodes: Node[];
  edges: Edge[];
}

interface NonTemporalCanvasState {
  componentLibrary: ComponentData[];
  selectedComponentId: string | null;
  aiLoading: boolean;
  aiError: string | null;
  designId: string | null;
  isSaving: boolean;
  isLoading: boolean;
  otherCursors: Record<string, Omit<CursorData, 'userId'>>;
}

type CanvasState = TemporalCanvasState & NonTemporalCanvasState;

type CanvasActions = {
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  fetchComponents: () => Promise<void>;
  setSelectedComponentId: (id: string | null) => void;
  updateNodeProps: (nodeId: string, props: Record<string, any>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  setNodeEditing: (nodeId: string, isEditing: boolean) => void;
  executeAIAction: (actionType: string, params?: any) => Promise<void>;
  saveDesign: () => Promise<void>;
  loadDesign: (id: string) => Promise<void>;
  createNewDesign: (title: string, description: string) => Promise<void>;
  applyRemoteNodeChanges: (changes: NodeChange[]) => void;
  applyRemoteEdgeChanges: (changes: EdgeChange[]) => void;
  updateCursor: (cursorData: CursorData) => void;
  removeCursor: (userId: string) => void;
  loadTemplate: (design: { nodes: Node[], edges: Edge[] }) => void;
};

type FullStore = CanvasState & CanvasActions;

const useInternalCanvasStore = create<FullStore>()(
  temporal(
    (set, get) => ({
      // --- Initial State ---
      nodes: [
        { id: '1', type: 'custom', position: { x: 250, y: 5 }, data: { label: 'API Gateway', componentId: 'api.gateway.v1', props: { apiName: 'my-api' } } },
        { id: '2', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Service A', componentId: 'compute.lambda.v1', props: { functionName: 'service-a', memorySize: 512 } } },
        { id: '3', type: 'custom', position: { x: 400, y: 100 }, data: { label: 'Service B', componentId: 'compute.lambda.v1', props: { functionName: 'service-b', memorySize: 512 } } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
      ],
      componentLibrary: [],
      selectedComponentId: null,
      aiLoading: false, aiError: null, designId: null, isSaving: false, isLoading: false, otherCursors: {},

      // --- Actions ---
      onNodesChange: (changes: NodeChange[]) => {
        const newNodes = applyNodeChanges(changes, get().nodes);
        set({ nodes: newNodes });
        socketService.emitNodeChanges(changes);
        const selectionChange = changes.find(change => change.type === 'select');
        if (selectionChange) {
          get().setSelectedComponentId(selectionChange.selected ? selectionChange.id : null);
        }
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        const newEdges = applyEdgeChanges(changes, get().edges);
        set({ edges: newEdges });
        socketService.emitEdgeChanges(changes);
      },
      onConnect: (connection: Connection) => set({ edges: addEdge(connection, get().edges) }),
      setNodes: (nodes: Node[]) => set({ nodes }),
      setEdges: (edges: Edge[]) => set({ edges }),
      addNode: (node: Node) => set({ nodes: get().nodes.concat(node) }),
      setSelectedComponentId: (id: string | null) => set({ selectedComponentId: id }),
      updateNodeProps: (nodeId: string, props: Record<string, any>) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, props } } : node
          ),
        });
        // Here you could also add a call to patch the design with the new props
      },
      updateNodeLabel: (nodeId: string, label: string) => {
        const { patchDesign } = require('@/services/api');
        const designId = get().designId;
        const node = get().nodes.find(n => n.id === nodeId);
        const nodeIndex = get().nodes.findIndex(n => n.id === nodeId);

        if (!designId || !node || nodeIndex === -1) return;

        // Optimistically update the UI
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, label, isEditing: false } } : n
          ),
        });

        // Persist the change to the backend
        const patch = [{ op: 'replace' as const, path: `/nodes/${nodeIndex}/data/label`, value: label }];
        patchDesign(designId, patch, `Updated label for node ${nodeId}`).catch(err => {
          console.error("Failed to update label on backend:", err);
          // Optionally, revert the change in the UI
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, label: node.data.label } } : n
            ),
          });
        });
      },
      setNodeEditing: (nodeId: string, isEditing: boolean) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, isEditing } } : { ...node, data: { ...node.data, isEditing: false } }
          ),
        });
      },
      applyRemoteNodeChanges: (changes: NodeChange[]) => {
        // This should be handled by the temporal middleware
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },
      applyRemoteEdgeChanges: (changes: EdgeChange[]) => {
        // This should be handled by the temporal middleware
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },
      updateCursor: ({ userId, ...cursorData }) => {
        set(state => ({ otherCursors: { ...state.otherCursors, [userId]: cursorData } }));
      },
      removeCursor: (userId: string) => {
        set(state => {
          const { [userId]: _, ...remainingCursors } = state.otherCursors;
          return { otherCursors: remainingCursors };
        });
      },
      fetchComponents: async () => {
        const { fetchComponents: fetchComponentsApi } = await import('@/services/api');
        try {
          const components = await fetchComponentsApi();
          set({ componentLibrary: components });
        } catch (error) {
          console.error("Failed to fetch components:", error);
          // Handle error appropriately in the UI
        }
      },
      executeAIAction: async (actionType: string, params?: any) => {
        const { runAgent } = await import('@/services/api');
        const designId = get().designId;
        if (!designId) {
          set({ aiError: "No design is currently loaded." });
          return;
        }

        set({ aiLoading: true, aiError: null });
        try {
          const request = {
            goal: params?.goal || `Perform ${actionType}`,
            designId,
            constraints: params,
          };
          const response = await runAgent(actionType.toLowerCase(), request);
          if (response.success && response.patches) { // The API seems to return patches, not 'changes'
            const { applyPatch } = await import('fast-json-patch');
            const currentDesign = { nodes: get().nodes, edges: get().edges };
            // The applyPatch function mutates the document.
            const { newDocument } = applyPatch(currentDesign, response.patches, true, false);
            set({ nodes: newDocument.nodes, edges: newDocument.edges });
            // Optionally, show a success message to the user from response.message
          }
        } catch (error: any) {
          set({ aiError: error.message || "An unknown AI error occurred." });
        } finally {
          set({ aiLoading: false });
        }
      },
      saveDesign: async () => {
        const { saveFullDesign } = await import('@/services/api');
        const { designId, nodes, edges, isSaving } = get();
        if (!designId || isSaving) return;

        set({ isSaving: true });
        try {
          await saveFullDesign(designId, nodes, edges);
        } catch (error) {
          console.error("Failed to save design:", error);
        } finally {
          set({ isSaving: false });
        }
      },
      loadDesign: async (id: string) => {
        const { getDesignById } = await import('@/services/api');
        set({ isLoading: true });
        try {
          const design = await getDesignById(id);
          set({
            nodes: design.canvas.nodes || [],
            edges: (design.canvas.links as Edge[]) || [],
            designId: design.id,
          });
        } catch (error) {
          console.error("Failed to load design:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      createNewDesign: async (title: string, description: string) => {
        const { createDesign } = await import('@/services/api');
        set({ isLoading: true });
        try {
          const newDesign = await createDesign({ title, description });
          set({
            nodes: [],
            edges: [],
            designId: newDesign.id,
          });
          // Also clear the undo/redo history
          get().temporal.clear();
        } catch (error) {
          console.error("Failed to create new design:", error);
          // You might want to show an error to the user
        } finally {
          set({ isLoading: false });
        }
      },
      loadTemplate: (design: { nodes: Node[], edges: Edge[] }) => {
        set({ nodes: design.nodes, edges: design.edges });
      },
    }),
    {
      partialize: (state) => {
        const { nodes, edges } = state;
        return { nodes, edges };
      },
    }
  )
);

// The async actions are now implemented inside the 'create' call,
// which is the standard practice for Zustand. This avoids confusion
// and ensures the store's 'get' and 'set' are used correctly within actions.


import { useStoreWithEqualityFn } from 'zustand/traditional';

// Custom hook to expose a clean API to components
export const useCanvasStore = useInternalCanvasStore;

export function useTemporalStore<T>(
  selector: (state: TemporalState<TemporalCanvasState>) => T,
  equality?: (a: T, b: T) => boolean,
) {
  return useStoreWithEqualityFn(useInternalCanvasStore.temporal, selector, equality);
}
