import { useState, useEffect } from 'react';
import { useCanvasStore, useTemporalStore } from '@/store/canvasStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Save, PlusCircle, ChevronsUpDown, Undo2, Redo2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { TemplatePicker } from './TemplatePicker';
import * as api from '@/services/api';
import type { Design } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const {
    saveDesign,
    loadDesign,
    createNewDesign,
    isSaving,
    isLoading,
    designId,
  } = useCanvasStore();
  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);
  const [designs, setDesigns] = useState<Design[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getAllDesigns().then(setDesigns).catch(console.error);
  }, [designId]);

  const handleSave = () => saveDesign();
  const handleNewDesign = () => {
    const title = window.prompt("Enter a title for the new design:", "New Design");
    if (title) {
      createNewDesign(title, "A new design created from the editor.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDesign = designs.find(d => d.id === designId);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background p-2 rounded-lg shadow-md border flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => undo()} disabled={pastStates.length === 0} title="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => redo()} disabled={futureStates.length === 0} title="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="border-l h-6 mx-2" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-48 justify-between">
            <span>{currentDesign?.title || "Select a Design"}</span>
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Your Designs</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {designs.map(design => (
            <DropdownMenuItem key={design.id} onSelect={() => loadDesign(design.id)} disabled={isLoading}>
              {design.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="icon" onClick={handleNewDesign} disabled={isLoading} title="New Design">
        <PlusCircle className="h-4 w-4" />
      </Button>

      <div className="border-l h-6 mx-2" />

      <Button variant="outline" size="icon" onClick={handleSave} disabled={isSaving} title="Save">
        <Save className="h-4 w-4" />
      </Button>
      <TemplatePicker />

      <div className="border-l h-6 mx-2" />

      <ThemeToggle />
      <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
