import { DesignPanel } from './DesignPanel';
import { CreatePanel } from './CreatePanel';
import { PropertiesPanel } from './PropertiesPanel';
import { SlidersHorizontal, Sparkles, PencilRuler } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RightSidebar() {
  return (
    <aside className="w-96 bg-muted border-l">
      <Tabs defaultValue="design" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 rounded-none">
          <TabsTrigger value="design">
            <PencilRuler className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="create">
            <Sparkles className="h-4 w-4 mr-2" />
            Create
          </TabsTrigger>
          <TabsTrigger value="properties">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Properties
          </TabsTrigger>
        </TabsList>
        <TabsContent value="design" className="flex-grow overflow-y-auto">
          <DesignPanel />
        </TabsContent>
        <TabsContent value="create" className="flex-grow overflow-y-auto">
          <CreatePanel />
        </TabsContent>
        <TabsContent value="properties" className="flex-grow overflow-y-auto">
          <PropertiesPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
