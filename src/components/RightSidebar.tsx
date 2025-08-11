import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertiesPanel } from './PropertiesPanel';
import { AiPanel } from './AiPanel';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export function RightSidebar() {
  return (
    <aside className="w-96 bg-muted border-l">
      <Tabs defaultValue="properties" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none">
          <TabsTrigger value="properties">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            AI
          </TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="flex-grow overflow-y-auto">
          <PropertiesPanel />
        </TabsContent>
        <TabsContent value="ai" className="flex-grow overflow-y-auto">
          <AiPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
