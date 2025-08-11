import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LayoutTemplate } from "lucide-react"
import { MOCK_TEMPLATES } from "@/utils/mock-templates"

export function TemplatePicker() {
  const handleLoadTemplate = (design: any) => {
    // TODO: Re-implement template loading with Excalidraw
    console.log("Template loading is not implemented yet.", design);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutTemplate className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Load a Template</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCK_TEMPLATES.map((template) => (
          <DropdownMenuItem
            key={template.name}
            onClick={() => handleLoadTemplate(template.design)}
            disabled // Temporarily disable until re-implemented
          >
            {template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
