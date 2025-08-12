import { useState, useEffect } from 'react';
import { useCanvasStore, useTemporalStore } from '@/store/canvasStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ComponentPicker } from './ComponentPicker';
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
    otherCursors,
  } = useCanvasStore();
  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getAllDesigns().then(setDesigns).catch(console.error);
  }, [designId]);

  const currentDesign = designs.find(d => d.id === designId);

  useEffect(() => {
    if (currentDesign) {
      setCurrentTitle(currentDesign.title);
    }
  }, [currentDesign]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (designId && currentTitle && currentTitle !== currentDesign?.title) {
      useCanvasStore.getState().updateDesignTitle(designId, currentTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setCurrentTitle(currentDesign?.title || '');
    }
  };

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

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => undo()} disabled={pastStates.length === 0} title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => redo()} disabled={futureStates.length === 0} title="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-64 justify-between">
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
        <Button variant="outline" size="sm" onClick={handleNewDesign} disabled={isLoading}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Design
        </Button>
      </div>

      <div className="flex-1 flex justify-center" onDoubleClick={() => setIsEditingTitle(true)}>
        {isEditingTitle ? (
          <Input
            type="text"
            value={currentTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-lg font-semibold"
            autoFocus
          />
        ) : (
          <h1 className="text-lg font-semibold p-2 rounded-md hover:bg-muted cursor-pointer">
            {currentDesign?.title || 'Untitled Design'}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-2 overflow-hidden">
          {Object.entries(otherCursors).map(([id, cursor]) => (
            <div key={id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background" title={cursor.name || id}>
              <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                {cursor.name ? cursor.name.substring(0, 2).toUpperCase() : '??'}
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="icon" onClick={handleSave} disabled={isSaving} title="Save">
          <Save className="h-4 w-4" />
        </Button>
        <ComponentPicker />
        <TemplatePicker />
        <ThemeToggle />
        <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
