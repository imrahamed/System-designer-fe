import { create } from 'zustand';
import { temporal } from 'zundo';
import type { TemporalState } from 'zundo';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { ComponentData } from '@/utils/mock-components';
import { socketService } from '@/services/socket';
import { saveFullDesign, getDesignById, createDesign as createDesignApi, patchDesign } from '@/services/api';
import type { Node } from 'reactflow'; // Keep for saving/loading

export interface CursorData {
  userId: string;
  x: number;
  y: number;
  name?: string;
}

interface TemporalCanvasState {
  excalidrawElements: readonly ExcalidrawElement[];
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
  setExcalidrawElements: (elements: readonly ExcalidrawElement[]) => void;
  applyRemoteSceneUpdate: (elements: readonly ExcalidrawElement[]) => void;
  fetchComponents: () => Promise<void>;
  setSelectedComponentId: (id: string | null) => void;
  updateElementProps: (elementId: string, props: Record<string, any>) => void;
  executeAIAction: (actionType: string, params?: any) => Promise<void>;
  saveDesign: () => Promise<void>;
  loadDesign: (id: string) => Promise<void>;
  createNewDesign: (title: string, description: string) => Promise<void>;
  updateCursor: (cursorData: CursorData) => void;
  removeCursor: (userId: string) => void;
};

type FullStore = CanvasState & CanvasActions;

const useInternalCanvasStore = create<FullStore>()(
  temporal(
    (set, get) => ({
      // --- Initial State ---
      excalidrawElements: [],
      componentLibrary: [],
      selectedComponentId: null,
      aiLoading: false,
      aiError: null,
      designId: null,
      isSaving: false,
      isLoading: false,
      otherCursors: {},

      // --- Actions ---
      setExcalidrawElements: (elements: readonly ExcalidrawElement[]) => {
        set({ excalidrawElements: elements });
        socketService.emitSceneUpdate(elements);
      },
      applyRemoteSceneUpdate: (elements: readonly ExcalidrawElement[]) => {
        set({ excalidrawElements: elements });
      },
      setSelectedComponentId: (id: string | null) => set({ selectedComponentId: id }),
      updateElementProps: (elementId: string, props: Record<string, any>) => {
        const newElements = get().excalidrawElements.map((element) =>
          element.id === elementId
            ? {
                ...element,
                customData: {
                  ...element.customData,
                  props,
                },
              }
            : element
        );
        set({ excalidrawElements: newElements });
        socketService.emitSceneUpdate(newElements);
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
        }
      },
      executeAIAction: async (actionType: string, params?: any) => {
        const { designId, excalidrawElements, saveDesign } = get();
        if (!designId) {
          set({ aiError: "No design is currently loaded." });
          return;
        }

        set({ aiLoading: true, aiError: null });
        try {
          // First, save the current design to ensure the backend has the latest version
          await saveDesign();

          const request = {
            goal: params?.goal || `Perform ${actionType}`,
            designId,
            constraints: params,
          };

          const { runAgent } = await import('@/services/api');
          const response = await runAgent(actionType.toLowerCase(), request);

          if (response.success && response.patches) {
            const { applyPatch } = await import('fast-json-patch');

            // The AI agent will return patches for the document stored in the DB.
            // We need to construct a similar document to apply the patches to.
            const currentSceneString = JSON.stringify(excalidrawElements);
            const docToPatch = {
              nodes: [{
                id: 'excalidraw-scene',
                type: 'excalidraw',
                position: { x: 0, y: 0 },
                data: { scene: currentSceneString },
              }],
              edges: [],
            };

            const { newDocument } = applyPatch(docToPatch, response.patches, true, false);

            const newSceneString = newDocument.nodes[0]?.data?.scene;
            if (newSceneString && typeof newSceneString === 'string') {
              const newElements = JSON.parse(newSceneString);
              set({ excalidrawElements: newElements });
            } else {
              throw new Error("AI returned an invalid patch.");
            }
          } else if (!response.success) {
            set({ aiError: response.message || "The AI action failed." });
          }
        } catch (error: any) {
          set({ aiError: error.message || "An unknown AI error occurred." });
        } finally {
          set({ aiLoading: false });
        }
      },
      saveDesign: async () => {
        const { designId, excalidrawElements, isSaving } = get();
        if (!designId || isSaving) return;

        set({ isSaving: true });
        try {
          const sceneData = JSON.stringify(excalidrawElements);
          const node: Node = {
            id: 'excalidraw-scene',
            type: 'excalidraw',
            position: { x: 0, y: 0 },
            data: { scene: sceneData },
          };
          await saveFullDesign(designId, [node], []);
        } catch (error) {
          console.error("Failed to save design:", error);
        } finally {
          set({ isSaving: false });
        }
      },
      loadDesign: async (id: string) => {
        set({ isLoading: true });
        try {
          const design = await getDesignById(id);
          const excalidrawNode = design.canvas.nodes?.find(n => n.type === 'excalidraw');

          if (excalidrawNode && excalidrawNode.data.scene) {
            const elements = JSON.parse(excalidrawNode.data.scene);
            set({
              excalidrawElements: elements,
              designId: design.id,
            });
          } else {
            set({
              excalidrawElements: [],
              designId: design.id,
            });
          }
        } catch (error) {
          console.error("Failed to load design:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      createNewDesign: async (title: string, description: string) => {
        set({ isLoading: true });
        try {
          const newDesign = await createDesignApi({ title, description });
          set({
            excalidrawElements: [],
            designId: newDesign.id,
          });
          get().temporal.clear();
        } catch (error) {
          console.error("Failed to create new design:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      partialize: (state) => {
        const { excalidrawElements } = state;
        return { excalidrawElements };
      },
    }
  )
);

import { useStoreWithEqualityFn } from 'zustand/traditional';

export const useCanvasStore = useInternalCanvasStore;

export function useTemporalStore<T>(
  selector: (state: TemporalState<TemporalCanvasState>) => T,
  equality?: (a: T, b: T) => boolean,
) {
  return useStoreWithEqualityFn(useInternalCanvasStore.temporal, selector, equality);
}
