import { useCanvasStore, useTemporalStore } from '@/store/canvasStore';
import { Button } from '@/components/ui/button';
import { Sparkles, Save, FolderOpen, Undo2, Redo2, ShieldCheck, Wand } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { TemplatePicker } from './TemplatePicker';

export function TopBar() {
  const {
    executeAIAction,
    aiLoading,
    saveDesign,
    loadDesign,
    isSaving,
    isLoading,
    designId,
  } = useCanvasStore();
  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);

  const handleAIAction = (actionType: string) => () => executeAIAction(actionType);
  const handleSave = () => saveDesign();
  const handleLoad = () => {
    const idToLoad = window.prompt("Enter the ID of the design to load:", designId || '');
    if (idToLoad) loadDesign(idToLoad);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background p-2 rounded-lg shadow-md border flex items-center gap-2">
      {/* History Actions */}
      <Button variant="outline" size="icon" onClick={() => undo()} disabled={pastStates.length === 0} title="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => redo()} disabled={futureStates.length === 0} title="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="border-l h-6 mx-2" />

      {/* AI Actions */}
      <Button variant="outline" size="sm" onClick={handleAIAction('EXPLAIN_DESIGN')} disabled={aiLoading}>
        <Sparkles className="h-4 w-4 mr-2" />
        Explain
      </Button>
      <Button variant="outline" size="sm" onClick={handleAIAction('REFACTOR')} disabled={aiLoading}>
        <Sparkles className="h-4 w-4 mr-2" />
        Refactor
      </Button>
      <Button variant="outline" size="sm" onClick={handleAIAction('AUTO_COMPLETE')} disabled={aiLoading}>
        <Wand className="h-4 w-4 mr-2" />
        Auto-Complete
      </Button>
      <Button variant="outline" size="sm" onClick={handleAIAction('SECURITY_AUDIT')} disabled={aiLoading}>
        <ShieldCheck className="h-4 w-4 mr-2" />
        Security Audit
      </Button>

      <div className="border-l h-6 mx-2" />

      {/* Save/Load Actions */}
      <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
      <Button variant="outline" size="sm" onClick={handleLoad} disabled={isLoading}>
        <FolderOpen className="h-4 w-4 mr-2" />
        Load
      </Button>
      <TemplatePicker />

      <div className="border-l h-6 mx-2" />

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}
