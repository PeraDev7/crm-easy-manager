
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateQuoteForm } from "./CreateQuoteForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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
  project?: Project | null;
  onSubmit: (data: any) => void;
}

export function CreateQuoteSheet({
  isOpen,
  onOpenChange,
  project: initialProject,
  onSubmit,
}: CreateQuoteSheetProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(initialProject || null);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name)");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuovo Preventivo</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <Label>Progetto (opzionale)</Label>
            <Select
              value={selectedProject?.id || ""}
              onValueChange={(value) => {
                if (value === "") {
                  setSelectedProject(null);
                } else {
                  const project = projects?.find((p) => p.id === value);
                  setSelectedProject(project || null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un progetto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nessun progetto</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <CreateQuoteForm
            projectId={selectedProject?.id || null}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
