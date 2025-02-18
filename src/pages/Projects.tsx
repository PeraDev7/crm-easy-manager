import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type Project = {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  created_at: string;
  clients?: {
    name: string;
  };
};

const Projects = () => {
  useRequireAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").insert({
        name,
        description,
        client_id: clientId,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsOpen(false);
      setName("");
      setDescription("");
      setClientId("");
      toast({
        title: "Progetto creato",
        description: "Il progetto è stato creato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({
          name,
          description,
          client_id: clientId,
        })
        .eq("id", selectedProject?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsEditOpen(false);
      setName("");
      setDescription("");
      setClientId("");
      setSelectedProject(null);
      toast({
        title: "Progetto aggiornato",
        description: "Il progetto è stato aggiornato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
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
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate();
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setName(project.name);
    setDescription(project.description || "");
    setClientId(project.client_id);
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProjectMutation.mutate(id);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Progetti</h1>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Progetto
          </Button>
        </div>

        {isLoading ? (
          <div>Caricamento...</div>
        ) : (
          <div className="grid gap-4">
            {projects?.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            {project.name}
                          </Button>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {project.clients?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nuovo Progetto</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome del progetto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  placeholder="Descrizione del progetto"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <select
                  id="client"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Seleziona un cliente</option>
                  {clients?.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleSubmit}>Crea Progetto</Button>
          </SheetContent>
        </Sheet>

        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetTrigger asChild>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Modifica Progetto</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome del progetto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  placeholder="Descrizione del progetto"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <select
                  id="client"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Seleziona un cliente</option>
                  {clients?.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleEditSubmit}>Aggiorna Progetto</Button>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default Projects;
