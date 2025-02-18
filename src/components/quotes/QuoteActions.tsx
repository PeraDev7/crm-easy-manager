
import { Download, FileText, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteActionsProps {
  quoteId: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

export function QuoteActions({ 
  quoteId, 
  onView, 
  onEdit, 
  onDelete, 
  onDownload 
}: QuoteActionsProps) {
  return (
    <div className="space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDownload()}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onView()}
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit()}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete()}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
