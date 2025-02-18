import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Paperclip, ListTodo, Trash2, Download, Settings, Save } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Editor } from "@/components/ui/editor";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Attachment {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  created_by: string;
  project_id: string | null;
  task_id: string | null;
}

const ProjectDetails = () => {
  useRequireAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [note, setNote] = useState("");
  const [unsavedNote, setUnsavedNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: attachments, isLoading: isLoadingAttachments } = useQuery<Attachment[]>({
    queryKey: ["attachments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from("tasks").insert({
        title,
        project_id: id,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        status: "todo",
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

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      toast({
        title: "Task aggiornato",
        description: "Lo stato del task è stato aggiornato",
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

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      toast({
        title: "Task eliminato",
        description: "Il task è stato eliminato con successo",
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

  const deleteFileMutation = useMutation({
    mutationFn: async (attachment: Attachment) => {
      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove([attachment.file_path]);
      
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("attachments")
        .delete()
        .eq("id", attachment.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", id] });
      toast({
        title: "File eliminato",
        description: "Il file è stato eliminato con successo",
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

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, description }: { file: File; description: string }) => {
      const fileExt = file.name.split(".").pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("attachments").insert({
        name: file.name,
        description,
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
      setFileDescription("");
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

  const saveNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const { error } = await supabase
        .from("projects")
        .update({ description: notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast({
        title: "Note salvate",
        description: "Le note sono state salvate con successo",
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-l-4 border-l-green-500";
      case "in_progress":
        return "border-l-4 border-l-orange-500";
      case "todo":
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate({ file, description: fileDescription });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      addTaskMutation.mutate(taskTitle);
    }
  };

  const getFileUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("attachments")
      .createSignedUrl(filePath, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    queryClient.setQueryData(["tasks", id], items);

    const updatePromises = items.map((task, index) => {
      return supabase
        .from("tasks")
        .update({ position: index })
        .eq("id", task.id);
    });

    Promise.all(updatePromises).catch((error) => {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento dell'ordine dei task",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
    });
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
          <h1 className="text-2xl font-bold flex-1">{project?.name}</h1>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setName(project?.name || "");
              setDescription(project?.description || "");
              setClientId(project?.client_id || "");
              setIsEditOpen(true);
            }}
          >
            <Settings className="h-4 w-4" />
            Impostazioni progetto
          </Button>
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

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid gap-4"
                  >
                    {isLoadingTasks ? (
                      <div>Caricamento task...</div>
                    ) : (
                      tasks?.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card className={cn("overflow-hidden", getTaskStatusColor(task.status))}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                                      <span>{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={task.status}
                                        onValueChange={(value) =>
                                          updateTaskStatusMutation.mutate({
                                            taskId: task.id,
                                            status: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Seleziona stato" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="todo">Da fare</SelectItem>
                                          <SelectItem value="in_progress">In lavorazione</SelectItem>
                                          <SelectItem value="completed">Completato</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteTaskMutation.mutate(task.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Carica File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Descrizione del file..."
                />
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="max-w-sm"
                />
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {isLoadingAttachments ? (
                <div>Caricamento file...</div>
              ) : (
                attachments?.map((attachment) => (
                  <Card key={attachment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{attachment.name}</span>
                          </div>
                          {attachment.description && (
                            <p className="text-sm text-muted-foreground">
                              {attachment.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Caricato il{" "}
                            {format(
                              new Date(attachment.created_at),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => getFileUrl(attachment.file_path)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFileMutation.mutate(attachment);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Note del Progetto</CardTitle>
                <Button 
                  onClick={() => {
                    saveNotesMutation.mutate(unsavedNote);
                    setNote(unsavedNote);
                  }}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salva
                </Button>
              </CardHeader>
              <CardContent>
                <Editor
                  value={project?.description || ""}
                  onChange={(value) => setUnsavedNote(value)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className="w-full max-w-md">
            <SheetHeader>
              <SheetTitle>Impostazioni Progetto</SheetTitle>
            </SheetHeader>
            <CardContent>
              <div className="space-y-4 py-4">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome del progetto"
                />
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrizione del progetto"
                />
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="ID cliente"
                />
              </div>
            </CardContent>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Annulla
              </Button>
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from("projects")
                      .update({ name, description, client_id: clientId })
                      .eq("id", id);
                    
                    if (error) throw error;
                    
                    queryClient.invalidateQueries({ queryKey: ["project", id] });
                    toast({
                      title: "Progetto aggiornato",
                      description: "Le impostazioni del progetto sono state aggiornate",
                    });
                    setIsEditOpen(false);
                  } catch (error: any) {
                    toast({
                      title: "Errore",
                      description: error.message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Salva
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default ProjectDetails;
