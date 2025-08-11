import { memo } from 'react';
import type { CSSProperties } from 'react';

const lassoStyle: CSSProperties = {
  position: 'absolute',
  border: '2px dashed #0066CC',
  backgroundColor: 'rgba(0, 102, 204, 0.1)',
  pointerEvents: 'none',
};

interface LassoProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Lasso = ({ x, y, width, height }: LassoProps) => {
  if (width === 0 || height === 0) {
    return null;
  }

  return <div style={{ ...lassoStyle, left: x, top: y, width, height }} />;
};

export default memo(Lasso);
