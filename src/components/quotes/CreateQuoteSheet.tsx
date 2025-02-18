
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreateQuoteForm } from "./CreateQuoteForm";

interface Project {
  id: string;
  name: string;
  clients?: {
    name: string;
  };
}

interface CreateQuoteSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSubmit: (data: any) => void;
}

export function CreateQuoteSheet({
  isOpen,
  onOpenChange,
  project,
  onSubmit,
}: CreateQuoteSheetProps) {
  if (!project) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuovo Preventivo per {project.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <CreateQuoteForm
            projectId={project.id}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
