import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

const CommentNode = ({ data, id }: NodeProps<{ text: string; onTextChange: (id: string, text: string) => void }>) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.onTextChange(id, event.target.value);
  };

  return (
    <div className="p-4 shadow-lg rounded-lg bg-yellow-200 border-2 border-yellow-400 w-48 dark:bg-yellow-800 dark:border-yellow-600">
      <Handle type="target" position={Position.Left} className="!bg-yellow-500" />
      <Textarea
        value={data.text}
        onChange={handleChange}
        className="nodrag bg-transparent border-none focus:ring-0 dark:text-yellow-100 placeholder:text-yellow-700 dark:placeholder:text-yellow-300"
        placeholder="Add a comment..."
      />
      <Button variant="link" size="sm" className="mt-2 text-xs text-red-500 dark:text-red-400">
        Delete
      </Button>
    </div>
  );
};

export default memo(CommentNode);
