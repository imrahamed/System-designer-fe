import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasStore } from './canvasStore';
import * as api from '@/services/api';

// Mock the services
vi.mock('@/services/api');
vi.mock('@/services/socket', () => ({
  socketService: {
    emitSceneUpdate: vi.fn(),
  },
}));

describe('canvasStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCanvasStore.getState().setExcalidrawElements([]);
    useCanvasStore.setState({ designId: null });
  });

  it('should have a correct initial state', () => {
    const { excalidrawElements, designId } = useCanvasStore.getState();
    expect(excalidrawElements).toEqual([]);
    expect(designId).toBeNull();
  });

  it('should set excalidraw elements', () => {
    const newElements = [{ id: '1', type: 'rectangle' }] as any;
    useCanvasStore.getState().setExcalidrawElements(newElements);
    expect(useCanvasStore.getState().excalidrawElements).toEqual(newElements);
  });

  it('should update element props', () => {
    const initialElements = [{ id: '1', type: 'rectangle', customData: { props: { foo: 'bar' } } }] as any;
    useCanvasStore.getState().setExcalidrawElements(initialElements);

    useCanvasStore.getState().updateElementProps('1', { foo: 'baz' });

    const updatedElements = useCanvasStore.getState().excalidrawElements;
    expect(updatedElements[0].customData.props.foo).toBe('baz');
  });

  it('should save a design', async () => {
    const spy = vi.spyOn(api, 'saveFullDesign').mockResolvedValue({} as any);
    useCanvasStore.setState({ designId: 'test-design-id' });
    const elements = [{ id: '1', type: 'rectangle' }] as any;
    useCanvasStore.getState().setExcalidrawElements(elements);

    await useCanvasStore.getState().saveDesign();

    expect(spy).toHaveBeenCalledWith('test-design-id', [
      {
        id: 'excalidraw-scene',
        type: 'excalidraw',
        position: { x: 0, y: 0 },
        data: { scene: JSON.stringify(elements) },
      }
    ], []);
  });

  it('should load a design', async () => {
    const elements = [{ id: '1', type: 'rectangle' }] as any;
    const design = {
      id: 'test-design-id',
      canvas: {
        nodes: [{
          id: 'excalidraw-scene',
          type: 'excalidraw',
          data: { scene: JSON.stringify(elements) },
        }],
        links: [],
      },
    } as any;
    vi.spyOn(api, 'getDesignById').mockResolvedValue(design);

    await useCanvasStore.getState().loadDesign('test-design-id');

    expect(useCanvasStore.getState().designId).toBe('test-design-id');
    expect(useCanvasStore.getState().excalidrawElements).toEqual(elements);
  });
});
