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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

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

  const updateQuoteMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error: quoteError } = await supabase
        .from("quotes")
        .update({
          project_id: values.project_id,
          total_amount: values.total_amount,
          logo_url: values.logo_url,
          footer_text: values.footer_text,
          font_size: values.font_size,
        })
        .eq("id", values.id);

      if (quoteError) throw quoteError;

      const { error: deleteError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", values.id);

      if (deleteError) throw deleteError;

      const quoteItems = values.items.map((item: any) => ({
        quote_id: values.id,
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      setIsOpen(false);
      toast({
        title: "Preventivo aggiornato",
        description: "Il preventivo è stato aggiornato con successo",
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo preventivo?")) {
      deleteQuoteMutation.mutate(id);
    }
  };

  const handleEdit = async (id: string) => {
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("id", id)
      .single();

    if (quoteError) {
      toast({
        title: "Errore",
        description: "Errore nel caricamento del preventivo",
        variant: "destructive",
      });
      return;
    }

    const project = projects?.find((p) => p.id === quote.project_id);
    setSelectedProject(project || null);
    
    setIsOpen(true);
  };

  const handleDownload = async (id: string) => {
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(`
        *,
        quote_items(*),
        projects (
          name,
          clients (
            name,
            address,
            vat_number,
            tax_code
          )
        )
      `)
      .eq("id", id)
      .single();

    if (quoteError) {
      toast({
        title: "Errore",
        description: "Errore nel caricamento del preventivo",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    const fontSize = quote.font_size === "large" ? 14 : quote.font_size === "small" ? 10 : 12;
    doc.setFontSize(fontSize);

    if (quote.logo_url) {
      try {
        // In un'implementazione reale, dovresti gestire il caricamento dell'immagine
        // doc.addImage(quote.logo_url, "JPEG", 15, 15, 50, 50);
      } catch (error) {
        console.error("Errore nel caricamento del logo:", error);
      }
    }

    doc.setFontSize(fontSize + 4);
    doc.text(`Preventivo #${quote.number}`, 15, 20);
    doc.setFontSize(fontSize);

    doc.text(`Data: ${format(new Date(quote.date), "dd/MM/yyyy")}`, 15, 30);

    if (quote.projects?.clients) {
      const client = quote.projects.clients;
      doc.text("Cliente:", 15, 45);
      doc.text(client.name, 15, 55);
      if (client.address) doc.text(client.address, 15, 65);
      if (client.vat_number) doc.text(`P.IVA: ${client.vat_number}`, 15, 75);
      if (client.tax_code) doc.text(`C.F.: ${client.tax_code}`, 15, 85);
    }

    const tableRows = quote.quote_items.map((item: any) => [
      item.description,
      item.quantity,
      `€${item.unit_price.toFixed(2)}`,
      `${item.vat_rate}%`,
      `€${(item.quantity * item.unit_price * (1 + item.vat_rate / 100)).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: quote.projects?.clients ? 100 : 40,
      head: [["Descrizione", "Quantità", "Prezzo Unit.", "IVA", "Totale"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: fontSize },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Totale: €${quote.total_amount.toFixed(2)}`, 15, finalY);

    if (quote.footer_text) {
      doc.text(quote.footer_text, 15, finalY + 20);
    }

    doc.save(`preventivo_${quote.number}.pdf`);
    
    toast({
      title: "PDF generato",
      description: "Il PDF è stato generato e scaricato con successo",
    });
  };

  const filteredQuotes = quotes?.filter((quote) =>
    quote.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Preventivi</h1>
          <Button onClick={() => setIsOpen(true)}>
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
