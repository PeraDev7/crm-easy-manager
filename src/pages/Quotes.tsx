import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { CreateQuoteSheet } from "@/components/quotes/CreateQuoteSheet";

const Quotes = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          projects (
            name,
            clients (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name)");
      if (error) throw error;
      return data;
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          project_id: values.project_id,
          number: `Q-${Math.floor(Math.random() * 10000)}`,
          total_amount: values.total_amount,
          logo_url: values.logo_url,
          footer_text: values.footer_text,
          font_size: values.font_size,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      const quoteItems = values.items.map((item: any) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        vat_rate: item.vat_rate,
      }));

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      return quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      setIsOpen(false);
      toast({
        title: "Preventivo creato",
        description: "Il preventivo è stato creato con successo",
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

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Preventivo eliminato",
        description: "Il preventivo è stato eliminato con successo",
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

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo preventivo?")) {
      deleteQuoteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    console.log("Edit quote:", id);
  };

  const handleDownload = async (id: string) => {
    console.log("Download quote:", id);
  };

  const filteredQuotes = quotes?.filter((quote) =>
    quote.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Preventivi</h1>
          <Button onClick={() => handleProjectSelect(projects?.[0])}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Preventivo
          </Button>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          label="Cerca preventivo"
          placeholder="Cerca per numero..."
        />

        {isLoading ? (
          <div>Caricamento...</div>
        ) : (
          <div className="grid gap-4">
            {filteredQuotes?.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onConvert={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        <CreateQuoteSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          project={selectedProject}
          onSubmit={createQuoteMutation.mutate}
        />
      </div>
    </Layout>
  );
};

export default Quotes;
