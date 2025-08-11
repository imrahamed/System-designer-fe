import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useCanvasStore } from '@/store/canvasStore';
import { Input } from './ui/input';
import { getIconForCategory } from '@/utils/icons';

const CustomNode = ({ data, id }: NodeProps<{ label: string; isEditing?: boolean; componentId: string }>) => {
  const { updateNodeLabel, setNodeEditing, componentLibrary } = useCanvasStore();
  const component = componentLibrary.find(c => c.id === data.componentId);
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

  if (!component) {
    return <div className="px-4 py-2 shadow-md rounded-md bg-red-500 border-2 border-red-700">Component not found</div>;
  }

  const shape = component.id.split('.')[0];
  const Icon = getIconForCategory(component.category);

  const shapeClasses: Record<string, string> = {
    rectangle: 'rounded-md',
    circle: 'rounded-full w-24 h-24 flex items-center justify-center text-center',
    // Future shapes can be added here
  };

  const baseClasses = "px-4 py-2 shadow-md bg-background border-2 border-stone-400 flex flex-col items-center justify-center";
  const nodeClasses = `${baseClasses} ${shapeClasses[shape] || shapeClasses.rectangle}`;

  const hasImage = data.props?.imageUrl;

  return (
    <div className={nodeClasses}>
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      {hasImage ? (
        <img src={data.props.imageUrl} alt={data.label} className="w-16 h-16 object-cover rounded-md" />
      ) : (
        <Icon className="h-6 w-6 mb-1" />
      )}
      {data.isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="nodrag"
        />
      ) : (
        <div className="nodrag text-center" onDoubleClick={() => setNodeEditing(id, true)}>
          {data.label}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
};

export default memo(CustomNode);
