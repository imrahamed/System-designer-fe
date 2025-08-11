import { useState, useCallback } from 'react';
import { useReactFlow, type Node } from 'reactflow';

export const useLasso = () => {
  const [lasso, setLasso] = useState({ x: 0, y: 0, width: 0, height: 0, isActive: false });
  const { getNodes, setNodes } = useReactFlow();

  const startLasso = (event: React.MouseEvent) => {
    setLasso({ ...lasso, isActive: true, x: event.clientX, y: event.clientY, width: 0, height: 0 });
  };

  const moveLasso = (event: React.MouseEvent) => {
    if (!lasso.isActive) return;
    setLasso({ ...lasso, width: event.clientX - lasso.x, height: event.clientY - lasso.y });
  };

  const endLasso = () => {
    if (!lasso.isActive) return;

    const selectedNodes = getNodes().filter((node) => {
      if (!node.positionAbsolute) return false;
      const { x, y } = node.positionAbsolute;
      const { width, height } = node;

      const lassoX1 = Math.min(lasso.x, lasso.x + lasso.width);
      const lassoX2 = Math.max(lasso.x, lasso.x + lasso.width);
      const lassoY1 = Math.min(lasso.y, lasso.y + lasso.height);
      const lassoY2 = Math.max(lasso.y, lasso.y + lasso.height);

      const nodeX1 = x;
      const nodeX2 = x + (width || 0);
      const nodeY1 = y;
      const nodeY2 = y + (height || 0);

      return (
        nodeX1 < lassoX2 &&
        nodeX2 > lassoX1 &&
        nodeY1 < lassoY2 &&
        nodeY2 > lassoY1
      );
    });

    setNodes((nodes: Node[]) =>
      nodes.map((node) => ({
        ...node,
        selected: selectedNodes.some((selectedNode) => selectedNode.id === node.id),
      }))
    );

    setLasso({ ...lasso, isActive: false, width: 0, height: 0 });
  };

  return { lasso, startLasso, moveLasso, endLasso };
};
