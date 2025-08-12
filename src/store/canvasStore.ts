import { create } from 'zustand';
import { temporal } from 'zundo';
import type { TemporalState } from 'zundo';
import { applyPatch } from 'fast-json-patch';
// import type { ExcalidrawElement } from '@excalidraw/excalidraw/dist/excalidraw/src/types';
import type { Component, Template } from '@/types/api';
import { MOCK_COMPONENTS } from '@/utils/mock-components';
import { createShapeId } from 'tldraw';
import type { ComponentData } from '@/utils/mock-components';
import { socketService } from '@/services/socket';
import { saveFullDesign, getDesignById, createDesign as createDesignApi, patchDesign, runAgent, fetchComponents as fetchComponentsApi } from '@/services/api';

// Using any as a workaround for type import errors
type ExcalidrawElement = any;

export type EnrichedComponent = Component & Pick<ComponentData, 'schema' | 'defaultProps' | 'iacSnippet' | 'docs'>;

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
  componentLibrary: EnrichedComponent[];
  templates: Template[];
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
  fetchTemplates: () => Promise<void>;
  applyTemplate: (template: Template) => void;
  addComponent: (componentId: string) => void;
  setSelectedComponentId: (id: string | null) => void;
  updateElementProps: (elementId: string, props: Record<string, any>) => void;
  updateDesignTitle: (designId: string, newTitle: string) => Promise<void>;
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
      templates: [],
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
      updateDesignTitle: async (designId: string, newTitle: string) => {
        try {
          await patchDesign(designId, [{ op: 'replace', path: '/title', value: newTitle }], `Renamed design to "${newTitle}"`);
        } catch (error) {
          console.error("Failed to update design title:", error);
        }
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
        try {
          const componentsFromApi = await fetchComponentsApi();
          const componentsWithSchema = componentsFromApi.map(apiComponent => {
            const mockComponent = MOCK_COMPONENTS.find(mc => mc.id === apiComponent.id);
            return {
              ...apiComponent,
              schema: mockComponent?.schema,
              defaultProps: mockComponent?.defaultProps,
              iacSnippet: mockComponent?.iacSnippet,
              docs: mockComponent?.docs,
            };
          }) as EnrichedComponent[];
          set({ componentLibrary: componentsWithSchema });
        } catch (error) {
          console.error("Failed to fetch components:", error);
        }
      },
      fetchTemplates: async () => {
        const { getAllTemplates } = await import('@/services/api');
        try {
          const templatesFromApi = await getAllTemplates();
          set({ templates: templatesFromApi });
        } catch (error) {
          console.error("Failed to fetch templates:", error);
        }
      },
      applyTemplate: (template: Template) => {
        const { excalidrawElements, componentLibrary } = get();

        const newElements = [...excalidrawElements];

        let currentX = 200;
        let currentY = 200;
        const gridGap = 250;
        const elementsPerRow = 4;
        let elementsInCurrentRow = 0;

        template.components.forEach((templateComponent) => {
          const componentDef = componentLibrary.find(c => c.id === templateComponent.componentId);
          if (componentDef) {
            const newShape = {
              id: createShapeId(),
              type: 'geo',
              x: currentX,
              y: currentY,
              props: {
                w: 200,
                h: 60,
                text: componentDef.name,
                geo: 'rectangle',
                ...templateComponent.props,
              },
            };
            newElements.push(newShape as ExcalidrawElement);

            elementsInCurrentRow++;
            if (elementsInCurrentRow >= elementsPerRow) {
              elementsInCurrentRow = 0;
              currentX = 200;
              currentY += 100;
            } else {
              currentX += gridGap;
            }
          }
        });

        set({ excalidrawElements: newElements });
        socketService.emitSceneUpdate(newElements);
      },
      addComponent: (componentId: string) => {
        const { excalidrawElements, componentLibrary } = get();
        const componentDef = componentLibrary.find(c => c.id === componentId);

        if (componentDef) {
          const newShape = {
            id: createShapeId(),
            type: 'geo',
            x: 400,
            y: 400,
            props: {
              w: 200,
              h: 60,
              text: componentDef.name,
              geo: 'rectangle',
            },
          };

          const newElements = [...excalidrawElements, newShape as ExcalidrawElement];
          set({ excalidrawElements: newElements });
          socketService.emitSceneUpdate(newElements);
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
          await saveDesign();

          const request = {
            goal: params?.goal || `Perform ${actionType}`,
            designId,
            constraints: params,
          };

          const response = await runAgent(actionType.toLowerCase(), request);

          if (response.success && response.patches) {
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
          const node: any = {
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
          useInternalCanvasStore.temporal.getState().clear();
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
