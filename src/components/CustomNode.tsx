import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useCanvasStore } from '@/store/canvasStore';
import { Input } from './ui/input';

const CustomNode = ({ data, id }: NodeProps<{ label: string; isEditing?: boolean }>) => {
  const { updateNodeLabel, setNodeEditing } = useCanvasStore();
  const [inputValue, setInputValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [data.isEditing]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue.trim() && inputValue.trim() !== data.label) {
      updateNodeLabel(id, inputValue.trim());
    }
    // Exit editing mode regardless of change
    setNodeEditing(id, false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleInputBlur();
    } else if (event.key === 'Escape') {
      setInputValue(data.label);
      setNodeEditing(id, false);
    }
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-background border-2 border-stone-400">
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />

      {data.isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="nodrag" // Prevents node dragging while editing text
        />
      ) : (
        <div className="nodrag" onDoubleClick={() => setNodeEditing(id, true)}>
          {data.label}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
};

export default memo(CustomNode);
