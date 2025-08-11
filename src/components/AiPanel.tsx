import { useCanvasStore } from '@/store/canvasStore';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck, Wand } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AiPanel() {
  const { executeAIAction, aiLoading, aiError } = useCanvasStore();

  const handleAIAction = (actionType: string, params?: any) => () => {
    executeAIAction(actionType, params);
  };

  return (
    <Card className="h-full border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          AI Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Analysis</h3>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleAIAction('EXPLAIN_DESIGN')}
            disabled={aiLoading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Explain Design
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleAIAction('SECURITY_AUDIT')}
            disabled={aiLoading}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Audit Security
          </Button>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Modification</h3>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleAIAction('REFACTOR')}
            disabled={aiLoading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Refactor
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleAIAction('AUTO_COMPLETE')}
            disabled={aiLoading}
          >
            <Wand className="h-4 w-4 mr-2" />
            Auto-Complete
          </Button>
        </div>
        {aiError && (
            <p className="text-sm text-destructive mt-2">{aiError}</p>
        )}
        {aiLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
