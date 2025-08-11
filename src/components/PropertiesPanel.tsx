import { useCanvasStore } from '@/store/canvasStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DynamicForm } from './DynamicForm';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'framer-motion';

export function PropertiesPanel() {
  const {
    selectedComponentId,
    excalidrawElements,
    componentLibrary,
    updateElementProps,
  } = useCanvasStore();

  const element = excalidrawElements.find((el) => el.id === selectedComponentId);
  const componentId = element?.customData?.componentId;
  const componentDef = componentLibrary.find((c) => c.id === componentId);

  const handleFormSubmitSuccess = (values: Record<string, any>) => {
    if (element) {
      updateElementProps(element.id, values);
    }
  };

  const formKey = element?.id;
  const defaultValues = element?.customData?.props || {};

  return (
    <aside className="w-80 bg-muted p-4 border-l overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Details</h2>
      <AnimatePresence>
        {element && componentDef ? (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{element.label?.text || componentDef.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="properties">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="documentation">Docs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="properties" className="pt-4">
                    {componentDef.schema ? (
                      <DynamicForm
                        key={formKey}
                        componentId={componentDef.id}
                        schema={componentDef.schema}
                        defaultValues={defaultValues}
                        onSubmitSuccess={handleFormSubmitSuccess}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">No properties to configure.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="documentation" className="pt-4 prose dark:prose-invert">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{componentDef.docs}</ReactMarkdown>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-10"
          >
            <p>Select a component to see its properties and documentation.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
