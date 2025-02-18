
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Editor } from "@/components/ui/editor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";

export function PersonalNotes() {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");

  const { data: userId } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    },
  });

  const { data: userNotes } = useQuery({
    queryKey: ["user-notes", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return "";
      
      const { data, error } = await supabase
        .from("profiles")
        .select("notes")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) throw error;
      if (data?.notes) {
        setNotes(data.notes);
      }
      return data?.notes || "";
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      if (!userId) return;
      
      const { error } = await supabase
        .from("profiles")
        .update({ notes: newNotes })
        .eq("id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Note salvate",
        description: "Le tue note sono state salvate con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: "Impossibile salvare le note: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleNotesChange = (value: string) => {
    setNotes(value);
    updateNotesMutation.mutate(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Note Personali</CardTitle>
      </CardHeader>
      <CardContent>
        <Editor
          value={notes}
          onChange={handleNotesChange}
          className="min-h-[200px]"
        />
      </CardContent>
    </Card>
  );
}
