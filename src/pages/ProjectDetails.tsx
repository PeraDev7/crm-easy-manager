import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Paperclip, ListTodo, Trash2, Download, Settings, Save, AlertTriangle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "open" | "in progress" | "done";
  project_id: string;
  created_at: string;
};

type Attachment = {
  id: string;
  name: string;
  url: string;
  project_id: string;
  created_at: string;
};

const ProjectDetails = () => {
  useRequireAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setName(data?.name || "");
      setDescription(data?.description || "");
    },
  });

  const { data: tasks } = useQuery({
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

  const { data: attachments } = useQuery({
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

  const updateProjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({
          name,
          description,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsEditOpen(false);
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

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({
        title: taskTitle,
        description: taskDescription,
        project_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      setIsTaskOpen(false);
      setTaskTitle("");
      setTaskDescription("");
      toast({
        title: "Task creato",
        description: "Il task è stato creato con successo",
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

  const uploadFileMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;
      const { data, error } = await supabase.storage
        .from("attachments")
        .upload(`${id}/${selectedFile.name}`, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw error;

      const { error: dbError } = await supabase.from("attachments").insert({
        name: selectedFile.name,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${data?.path}`,
        project_id: id,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", id] });
      setSelectedFile(null);
      toast({
        title: "File caricato",
        description: "Il file è stato caricato con successo",
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

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      toast({
        title: "Task eliminato",
        description: "Il task è stato eliminato con successo",
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

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const { error } = await supabase
        .from("attachments")
        .delete()
        .eq("id", attachmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", id] });
      toast({
        title: "File eliminato",
        description: "Il file è stato eliminato con successo",
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
    mutationFn: async () => {
      // Prima eliminiamo tutti i task associati
      const { error: taskError } = await supabase
        .from("tasks")
        .delete()
        .eq("project_id", id);
      
      if (taskError) throw taskError;

      // Poi eliminiamo tutti i file associati
      const { error: fileError } = await supabase
        .from("attachments")
        .delete()
        .eq("project_id", id);
      
      if (fileError) throw fileError;

      // Infine eliminiamo il progetto
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      navigate("/projects");
      toast({
        title: "Progetto eliminato",
        description: "Il progetto e tutti i suoi contenuti sono stati eliminati con successo",
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate();
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    uploadFileMutation.mutate();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    deleteAttachmentMutation.mutate(attachmentId);
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  if (!project) {
    return <div>Progetto non trovato</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="attachments">Allegati</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Button onClick={() => setIsTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Task
              </Button>
            </div>
            <div className="grid gap-4">
              {tasks?.map((task) => (
                <Card key={task.id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {task.status}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="attachments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Allegati</h2>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Input type="file" id="file" onChange={handleFileChange} />
                <Button onClick={handleFileUpload} disabled={!selectedFile}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Carica File
                </Button>
              </div>
              {attachments?.map((attachment) => (
                <Card key={attachment.id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{attachment.name}</h3>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        <Download className="h-4 w-4 mr-2 inline-block" />
                        Scarica
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Impostazioni Progetto</h2>
              <Button onClick={() => setIsEditOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Modifica
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Sheet open={isTaskOpen} onOpenChange={setIsTaskOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nuovo Task</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  placeholder="Titolo del task"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input
                  id="description"
                  placeholder="Descrizione del task"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleTaskSubmit}>Crea Task</Button>
          </SheetContent>
        </Sheet>

        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Impostazioni Progetto</SheetTitle>
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
            </div>
            <SheetFooter className="flex flex-col gap-4 sm:flex-col">
              <Button onClick={handleEditSubmit} className="w-full">Aggiorna Progetto</Button>
              <Button 
                variant="destructive" 
                className="w-full gap-2"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash2 className="h-4 w-4" />
                Elimina Progetto
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Conferma eliminazione
              </AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare questo progetto. Questa azione eliminerà anche tutti i task e i file associati.
                <br /><br />
                <strong>Attenzione:</strong> Questa azione non può essere annullata. Tutti i dati verranno persi definitivamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  setShowDeleteAlert(false);
                  deleteProjectMutation.mutate();
                }}
              >
                Elimina tutto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ProjectDetails;
