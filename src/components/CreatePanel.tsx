import { useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand } from 'lucide-react';

export function CreatePanel() {
  const { executeAIAction, aiLoading } = useCanvasStore();
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (description.trim()) {
      executeAIAction('CREATE_FROM_DESCRIPTION', { description });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Create with AI</h3>
      <Textarea
        placeholder="Describe your design in markdown..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={10}
      />
      <Button onClick={handleCreate} disabled={aiLoading || !description.trim()} className="w-full">
        <Wand className="h-4 w-4 mr-2" />
        {aiLoading ? 'Generating...' : 'Generate Design'}
      </Button>
    </div>
  );
}
