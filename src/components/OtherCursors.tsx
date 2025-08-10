import { useCanvasStore } from '@/store/canvasStore';
import { MousePointer2 } from 'lucide-react';

// A simple component to render a cursor
function Cursor({ x, y, name }: { x: number; y: number; name?: string }) {
  return (
    <div
      className="absolute top-0 left-0 text-blue-500 pointer-events-none"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <MousePointer2 className="h-5 w-5" style={{ transform: 'rotate(-90deg)' }}/>
      {name && (
        <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-md">
          {name}
        </span>
      )}
    </div>
  );
}

// The main component to render all other users' cursors
export function OtherCursors() {
  const cursors = useCanvasStore((state) => state.otherCursors);

  return (
    <>
      {Object.entries(cursors).map(([userId, cursorData]) => (
        <Cursor key={userId} x={cursorData.x} y={cursorData.y} name={cursorData.name} />
      ))}
    </>
  );
}
