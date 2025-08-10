import { useMemo } from 'react';
import type { ComponentData } from '@/utils/mock-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCanvasStore } from '@/store/canvasStore';
import { motion } from 'framer-motion';

const onDragStart = (event: React.DragEvent, componentId: string) => {
  event.dataTransfer.setData('application/reactflow', componentId);
  event.dataTransfer.effectAllowed = 'move';
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export function ComponentPalette() {
  const componentLibrary = useCanvasStore((state) => state.componentLibrary);

  const groupedComponents = useMemo(() => {
    return componentLibrary.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<string, ComponentData[]>);
  }, [componentLibrary]);

  return (
    <aside className="w-72 bg-muted p-4 border-r overflow-y-auto">
      <motion.h2
        className="text-2xl font-bold mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Components
      </motion.h2>
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Object.entries(groupedComponents).map(([category, components]) => (
          <motion.div key={category} variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {components.map((component) => (
                  <div
                    key={component.id}
                    className="p-2 border rounded-md text-center cursor-grab bg-background hover:bg-muted-foreground/20"
                    onDragStart={(event) => onDragStart(event, component.id)}
                    draggable
                  >
                    {component.name}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </aside>
  );
}
