
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeadNotesSheetProps {
  leadId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadNotesSheet({
  leadId,
  isOpen,
  onOpenChange,
}: LeadNotesSheetProps) {
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["lead-notes", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("lead_notes")
        .insert({
          lead_id: leadId,
          content,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-notes", leadId] });
      setNewNote("");
      toast({
        title: "Nota aggiunta",
        description: "La nota è stata aggiunta con successo",
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
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Note del Lead</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Scrivi una nuova nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Button type="submit" disabled={!newNote.trim()}>
              Aggiungi Nota
            </Button>
          </form>

          <ScrollArea className="h-[400px] mt-4">
            {isLoading ? (
              <div>Caricamento...</div>
            ) : (
              <div className="space-y-4">
                {notes?.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-muted rounded-lg space-y-1"
                  >
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
