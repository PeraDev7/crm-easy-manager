import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

interface ViewEventSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export function ViewEventSheet({
  isOpen,
  onOpenChange,
  event,
}: ViewEventSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.extendedProps?.description || "",
        location: event.extendedProps?.location || "",
        startTime: event.start ? new Date(event.start).toISOString().slice(0, 16) : "",
        endTime: event.end ? new Date(event.end).toISOString().slice(0, 16) : "",
      });
    }
  }, [event]);

  const updateEventMutation = useMutation({
    mutationFn: async (values: typeof formData) => {
      const { data, error } = await supabase
        .from("events")
        .update({
          title: values.title,
          description: values.description,
          location: values.location,
          start_time: values.startTime,
          end_time: values.endTime,
        })
        .eq("id", event.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsEditing(false);
      toast({
        title: "Evento aggiornato",
        description: "L'evento è stato aggiornato con successo",
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

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onOpenChange(false);
      toast({
        title: "Evento eliminato",
        description: "L'evento è stato eliminato con successo",
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
    updateEventMutation.mutate(formData);
  };

  if (!event) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Modifica Evento" : "Dettagli Evento"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <Label>Titolo</Label>
                <p className="text-lg font-medium">{event.title}</p>
              </div>
              {event.extendedProps?.description && (
                <div>
                  <Label>Descrizione</Label>
                  <p className="text-gray-600">{event.extendedProps.description}</p>
                </div>
              )}
              {event.extendedProps?.location && (
                <div>
                  <Label>Luogo</Label>
                  <p className="text-gray-600">{event.extendedProps.location}</p>
                </div>
              )}
              {event.extendedProps?.leadName && (
                <div>
                  <Label>Lead associato</Label>
                  <p className="text-gray-600">{event.extendedProps.leadName}</p>
                </div>
              )}
              <div>
                <Label>Data e ora inizio</Label>
                <p className="text-gray-600">
                  {new Date(event.start).toLocaleString("it-IT")}
                </p>
              </div>
              <div>
                <Label>Data e ora fine</Label>
                <p className="text-gray-600">
                  {new Date(event.end).toLocaleString("it-IT")}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteEventMutation.mutate()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="location">Luogo</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="startTime">Data e ora inizio *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">Data e ora fine *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">Salva</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Annulla
                </Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
