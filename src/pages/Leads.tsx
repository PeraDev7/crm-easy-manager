
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Table as TableIcon, Grid, Calendar as CalendarIcon } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { LeadCard } from "@/components/leads/LeadCard";
import { CreateLeadSheet } from "@/components/leads/CreateLeadSheet";
import { EditLeadSheet } from "@/components/leads/EditLeadSheet";
import { LeadNotesSheet } from "@/components/leads/LeadNotesSheet";
import { LeadCalendar } from "@/components/leads/LeadCalendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  negotiating: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

const statusLabels = {
  new: "Nuovo contatto",
  contacted: "Contattato",
  negotiating: "Negoziazione",
  won: "Vinto",
  lost: "Perso",
};

const Leads = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "calendar">("grid");
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
      setIsCreateOpen(false);
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

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("leads")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsEditOpen(false);
      toast({
        title: "Lead aggiornato",
        description: "Il lead è stato aggiornato con successo",
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

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setIsEditOpen(true);
  };

  const handleAddNote = (lead: any) => {
    setSelectedLead(lead);
    setIsNotesOpen(true);
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "table" : viewMode === "table" ? "calendar" : "grid")}
            >
              {viewMode === "grid" ? (
                <TableIcon className="h-4 w-4" />
              ) : viewMode === "table" ? (
                <CalendarIcon className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Lead
            </Button>
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          label="Cerca lead"
          placeholder="Cerca per nome, azienda o email..."
        />

        {isLoading ? (
          <div>Caricamento...</div>
        ) : viewMode === "calendar" ? (
          <LeadCalendar />
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads?.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={() => handleEdit(lead)}
                onDelete={handleDelete}
                onAddNote={() => handleAddNote(lead)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Azienda</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Valore Stimato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.company || "-"}</TableCell>
                    <TableCell>{lead.email || "-"}</TableCell>
                    <TableCell>{lead.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status]}>
                        {statusLabels[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>€{lead.estimated_value.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(lead)}
                        >
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddNote(lead)}
                        >
                          Note
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(lead.id)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <CreateLeadSheet
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={createLeadMutation.mutate}
        />

        {selectedLead && (
          <>
            <EditLeadSheet
              lead={selectedLead}
              isOpen={isEditOpen}
              onOpenChange={setIsEditOpen}
              onSubmit={(id, data) => updateLeadMutation.mutate({ id, data })}
            />
            <LeadNotesSheet
              leadId={selectedLead.id}
              isOpen={isNotesOpen}
              onOpenChange={setIsNotesOpen}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Leads;
