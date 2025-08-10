import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContextMenuProps {
  top: number;
  left: number;
  onEdit: () => void;
  onClose: () => void;
}

export function ContextMenu({ top, left, onEdit, onClose }: ContextMenuProps) {
  return (
    <div
      style={{ top, left }}
      className="absolute z-50"
      // onMouseLeave={onClose} // This can be annoying, let's stick to explicit close
    >
      <Card className="w-48">
        <CardContent className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              onEdit();
              onClose();
            }}
          >
            Edit Name
          </Button>
          {/* Other context menu items can be added here */}
        </CardContent>
      </Card>
    </div>
  );
}
