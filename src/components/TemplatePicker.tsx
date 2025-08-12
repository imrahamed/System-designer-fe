import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllTemplates } from '@/services/api';
import type { Template } from '@/types/api';
import { useCanvasStore } from '@/store/canvasStore';

export function TemplatePicker() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const applyTemplate = useCanvasStore((state) => state.applyTemplate);

  useEffect(() => {
    getAllTemplates().then(setTemplates).catch(console.error);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Templates</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onSelect={() => applyTemplate(template)}
          >
            {template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
