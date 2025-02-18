
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { LeadCard } from "@/components/leads/LeadCard";
import { CreateLeadSheet } from "@/components/leads/CreateLeadSheet";

const Leads = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          ...values,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsOpen(false);
      toast({
        title: "Lead creato",
        description: "Il lead è stato creato con successo",
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

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: "Lead eliminato",
        description: "Il lead è stato eliminato con successo",
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo lead?")) {
      deleteLeadMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    // TODO: Implementare la modifica del lead
    console.log("Edit lead:", id);
  };

  const handleAddNote = (id: string) => {
    // TODO: Implementare l'aggiunta di note
    console.log("Add note to lead:", id);
  };

  const filteredLeads = leads?.filter((lead) =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lead</h1>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Lead
          </Button>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          label="Cerca lead"
          placeholder="Cerca per nome, azienda o email..."
        />

        {isLoading ? (
          <div>Caricamento...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads?.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
        )}

        <CreateLeadSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSubmit={createLeadMutation.mutate}
        />
      </div>
    </Layout>
  );
}

export default Leads;
