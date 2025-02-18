import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type ProjectFormData = {
  name: string;
  description: string | null;
  client_id: string;
  start_date: string | null;
  end_date: string | null;
  status: "in_progress" | "completed" | "todo";
  priority: "low" | "medium" | "high" | null;
  parent_id: string | null;
};

type Project = ProjectFormData & {
  id: string;
  created_at: string;
  created_by: string;
};

const Projects = () => {
  // Utilizziamo il nuovo hook per proteggere la rotta
  useRequireAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: null,
    client_id: "",
    start_date: null,
    end_date: null,
    status: "todo",
    priority: null,
    parent_id: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query per ottenere i progetti
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name)");
      if (error) throw error;
      return data;
    },
  });

  // Query per ottenere i clienti per il select
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  // Mutation per creare/aggiornare progetti
  const mutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const { error } = editingProject
        ? await supabase
            .from("projects")
            .update(data)
            .eq("id", editingProject.id)
        : await supabase.from("projects").insert({
            ...data,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      handleClose();
      toast({
        title: editingProject ? "Progetto aggiornato" : "Progetto creato",
        description: editingProject
          ? "Il progetto è stato aggiornato con successo"
          : "Il nuovo progetto è stato creato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation per eliminare progetti
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Progetto eliminato",
        description: "Il progetto è stato eliminato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      client_id: project.client_id,
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      priority: project.priority,
      parent_id: project.parent_id,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo progetto?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingProject(null);
    setFormData({
      name: "",
      description: null,
      client_id: "",
      start_date: null,
      end_date: null,
      status: "todo",
      priority: null,
      parent_id: null,
    });
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Progetti</h1>
        <Button onClick={() => setIsOpen(true)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Nuovo Progetto
        </Button>
      </div>

      {isLoading ? (
        <div>Caricamento...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{project.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Cliente: {project.clients?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div
                    className={cn(
                      "inline-block px-2 py-1 rounded-full text-xs font-medium",
                      getStatusBadgeColor(project.status)
                    )}
                  >
                    {project.status === "todo"
                      ? "Da fare"
                      : project.status === "in_progress"
                      ? "In corso"
                      : "Completato"}
                  </div>
                  {project.priority && (
                    <div
                      className={cn(
                        "text-sm font-medium",
                        getPriorityColor(project.priority)
                      )}
                    >
                      Priorità:{" "}
                      {project.priority === "high"
                        ? "Alta"
                        : project.priority === "medium"
                        ? "Media"
                        : "Bassa"}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {(project.start_date || project.end_date) && (
                    <div className="text-sm text-muted-foreground">
                      {project.start_date && (
                        <div>
                          Inizio: {format(new Date(project.start_date), "dd/MM/yyyy")}
                        </div>
                      )}
                      {project.end_date && (
                        <div>
                          Scadenza: {format(new Date(project.end_date), "dd/MM/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingProject ? "Modifica Progetto" : "Nuovo Progetto"}
            </SheetTitle>
            <SheetDescription>
              {editingProject
                ? "Modifica i dettagli del progetto"
                : "Crea un nuovo progetto"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nome del progetto"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente *</label>
                <Select
                  required
                  value={formData.client_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, client_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrizione</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value || null,
                    })
                  }
                  placeholder="Descrizione del progetto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stato</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "todo" | "in_progress" | "completed") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona lo stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Da fare</SelectItem>
                      <SelectItem value="in_progress">In corso</SelectItem>
                      <SelectItem value="completed">Completato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priorità</label>
                  <Select
                    value={formData.priority || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: value as "low" | "medium" | "high" | null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la priorità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bassa</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data inizio</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? (
                          format(new Date(formData.start_date), "dd/MM/yyyy")
                        ) : (
                          <span>Seleziona data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.start_date
                            ? new Date(formData.start_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            start_date: date ? date.toISOString() : null,
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data fine</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? (
                          format(new Date(formData.end_date), "dd/MM/yyyy")
                        ) : (
                          <span>Seleziona data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.end_date
                            ? new Date(formData.end_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            end_date: date ? date.toISOString() : null,
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={handleClose}>
                Annulla
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  "Salvataggio..."
                ) : editingProject ? (
                  "Aggiorna Progetto"
                ) : (
                  "Crea Progetto"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default Projects;
