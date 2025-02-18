
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Paperclip, ListTodo } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const ProjectDetails = () => {
  useRequireAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  // Query per ottenere i dettagli del progetto
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Query per ottenere i task del progetto
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", id);
      if (error) throw error;
      return data;
    },
  });

  // Query per ottenere gli allegati del progetto
  const { data: attachments, isLoading: isLoadingAttachments } = useQuery({
    queryKey: ["attachments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("project_id", id);
      if (error) throw error;
      return data;
    },
  });

  // Mutation per aggiungere un task
  const addTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from("tasks").insert({
        title,
        project_id: id,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      setTaskTitle("");
      toast({
        title: "Task aggiunto",
        description: "Il task è stato aggiunto con successo",
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

  // Mutation per caricare un file
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("attachments").insert({
        name: file.name,
        file_path: filePath,
        project_id: id,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        file_type: file.type,
        file_size: file.size,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", id] });
      toast({
        title: "File caricato",
        description: "Il file è stato caricato con successo",
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(file);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      addTaskMutation.mutate(taskTitle);
    }
  };

  if (isLoadingProject) {
    return (
      <Layout>
        <div>Caricamento...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-4 w-4" />
            Torna ai progetti
          </Button>
          <h1 className="text-2xl font-bold">{project?.name}</h1>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks">Task</TabsTrigger>
            <TabsTrigger value="files">File</TabsTrigger>
            <TabsTrigger value="notes">Note</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nuovo Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <Input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Titolo del task..."
                    required
                  />
                  <Button type="submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {isLoadingTasks ? (
                <div>Caricamento task...</div>
              ) : (
                tasks?.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                        <span>{task.title}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Carica File</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className="max-w-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {isLoadingAttachments ? (
                <div>Caricamento file...</div>
              ) : (
                attachments?.map((attachment) => (
                  <Card key={attachment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span>{attachment.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Note del Progetto</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Inserisci le note del progetto..."
                  className="min-h-[200px]"
                />
                <Button className="mt-4">Salva Note</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectDetails;
