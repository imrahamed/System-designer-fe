import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCanvasStore } from '@/store/canvasStore';
import type { EnrichedComponent } from '@/store/canvasStore';

export function ComponentPicker() {
  const { componentLibrary, addComponent } = useCanvasStore();

  const groupedComponents = useMemo(() => {
    return componentLibrary.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<string, EnrichedComponent[]>);
  }, [componentLibrary]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Add Component</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Component Library</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(groupedComponents).map(([category, components]) => (
          <DropdownMenuGroup key={category}>
            <DropdownMenuLabel>{category}</DropdownMenuLabel>
            {components.map((component) => (
              <DropdownMenuItem
                key={component.id}
                onSelect={() => addComponent(component.id)}
              >
                {component.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
