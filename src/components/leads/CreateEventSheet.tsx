
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateEventSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string;
  defaultDate?: Date;
}

export function CreateEventSheet({
  isOpen,
  onOpenChange,
  leadId,
  defaultDate,
}: CreateEventSheetProps) {
  const startDate = defaultDate || new Date();
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 ora

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: startDate.toISOString().slice(0, 16),
    endTime: endDate.toISOString().slice(0, 16),
    selectedLeadId: leadId || "",
  });

  useEffect(() => {
    if (defaultDate) {
      const newEndDate = new Date(defaultDate.getTime() + 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        startTime: defaultDate.toISOString().slice(0, 16),
        endTime: newEndDate.toISOString().slice(0, 16),
      }));
    }
  }, [defaultDate]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("events")
        .insert({
          title: values.title,
          description: values.description,
          location: values.location,
          start_time: values.startTime,
          end_time: values.endTime,
          lead_id: values.selectedLeadId || null,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        startTime: startDate.toISOString().slice(0, 16),
        endTime: endDate.toISOString().slice(0, 16),
        selectedLeadId: leadId || "",
      });
      toast({
        title: "Evento creato",
        description: "L'evento è stato creato con successo",
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
    createEventMutation.mutate(formData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nuovo Evento</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <Label htmlFor="lead">Lead associato</Label>
            <Select
              value={formData.selectedLeadId}
              onValueChange={(value) =>
                setFormData({ ...formData, selectedLeadId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un lead" />
              </SelectTrigger>
              <SelectContent>
                {leads?.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit">Crea</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
