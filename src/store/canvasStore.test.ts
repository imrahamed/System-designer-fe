import { describe, it, expect, vi } from 'vitest';
import { useCanvasStore } from './canvasStore';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/services/socket', () => ({
  socketService: {
    emitNodeChanges: vi.fn(),
    emitEdgeChanges: vi.fn(),
  },
}));

describe('canvas store', () => {
  it('should add a node', () => {
    const { result } = renderHook(() => useCanvasStore());
    const initialNodes = result.current.nodes;
    const newNode = { id: '4', position: { x: 0, y: 0 }, data: { label: 'New Node' } };

    act(() => {
      result.current.addNode(newNode);
    });

    expect(result.current.nodes).toHaveLength(initialNodes.length + 1);
    expect(result.current.nodes.find((n) => n.id === '4')).toBeDefined();
  });

  it('should set selected component id', () => {
    const { result } = renderHook(() => useCanvasStore());

    act(() => {
      result.current.setSelectedComponentId('1');
    });

    expect(result.current.selectedComponentId).toBe('1');
  });

  it('should update node props', () => {
    const { result } = renderHook(() => useCanvasStore());
    const initialNode = result.current.nodes[0];
    const newProps = { apiName: 'new-api' };

    act(() => {
      result.current.updateNodeProps(initialNode.id, newProps);
    });

    const updatedNode = result.current.nodes.find((n) => n.id === initialNode.id);
    expect(updatedNode?.data.props).toEqual(newProps);
  });
});
