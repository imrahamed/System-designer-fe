import { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, ChevronsUpDown } from 'lucide-react';
import * as api from '@/services/api';
import type { Design } from '@/types/api';

export function DesignPanel() {
  const { loadDesign, createNewDesign, isLoading, designId } = useCanvasStore();
  const [designs, setDesigns] = useState<Design[]>([]);

  useEffect(() => {
    api.getAllDesigns().then(setDesigns).catch(console.error);
  }, [designId]);

  const currentDesign = designs.find(d => d.id === designId);

  const handleNewDesign = () => {
    const title = window.prompt("Enter a title for the new design:", "New Design");
    if (title) {
      createNewDesign(title, "A new design created from the editor.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>{currentDesign?.title || "Select a Design"}</span>
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Your Designs</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {designs.map(design => (
            <DropdownMenuItem key={design.id} onSelect={() => loadDesign(design.id)} disabled={isLoading}>
              {design.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" onClick={handleNewDesign} disabled={isLoading} className="w-full">
        <PlusCircle className="h-4 w-4 mr-2" />
        New Design
      </Button>
    </div>
  );
}
