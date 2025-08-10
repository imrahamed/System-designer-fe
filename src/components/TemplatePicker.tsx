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
import { useCanvasStore } from "@/store/canvasStore"

export function TemplatePicker() {
  const loadTemplate = useCanvasStore((state) => state.loadTemplate)

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
            onClick={() => loadTemplate(template.design)}
          >
            {template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
