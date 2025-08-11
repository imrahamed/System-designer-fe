import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Lock,
  Pencil,
  MessageSquarePlus,
} from 'lucide-react';

interface ContextMenuProps {
  top: number;
  left: number;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onLock: () => void;
  onAddComment: () => void;
}

export function ContextMenu({
  top,
  left,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  onLock,
  onAddComment,
}: ContextMenuProps) {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div style={{ top, left }} className="absolute z-50">
      <Card className="w-48">
        <CardContent className="p-1">
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleAction(onEdit)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit Name
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleAction(onDuplicate)}>
            <Copy className="h-4 w-4 mr-2" /> Duplicate
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleAction(onLock)}>
            <Lock className="h-4 w-4 mr-2" /> Lock
          </Button>
          <Separator className="my-1" />
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleAction(onAddComment)}>
            <MessageSquarePlus className="h-4 w-4 mr-2" /> Add Comment
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleAction(onBringForward)}>
            <ArrowUp className="h-4 w-4 mr-2" /> Bring Forward
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleAction(onSendBackward)}>
            <ArrowDown className="h-4 w-4 mr-2" /> Send Backward
          </Button>
          <Separator className="my-1" />
          <Button variant="destructive" className="w-full justify-start" onClick={() => handleAction(onDelete)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
