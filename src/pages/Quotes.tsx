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

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const fontSize = quote.font_size === "large" ? 14 : quote.font_size === "small" ? 10 : 12;
    doc.setFontSize(fontSize);

    const primaryColor = "#9b87f5";
    const secondaryColor = "#403E43";
    const lightGray = "#F1F0FB";

    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    if (quote.logo_url) {
      try {
        const response = await fetch(quote.logo_url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          doc.addImage(base64data, "PNG", 15, 10, 40, 20, undefined, "FAST");
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Errore nel caricamento del logo:", error);
      }
    }

    doc.setTextColor("#FFFFFF");
    doc.setFontSize(24);
    doc.text("PREVENTIVO", 150, 20);
    doc.setFontSize(14);
    doc.text(`#${quote.number}`, 150, 30);

    doc.setTextColor(secondaryColor);
    doc.setFontSize(fontSize);

    const formattedDate = format(new Date(quote.date), "dd/MM/yyyy");
    doc.setFillColor(lightGray);
    doc.roundedRect(15, 50, 180, 10, 2, 2, "F");
    doc.text(`Data: ${formattedDate}`, 20, 56);

    let yPos = 70;
    if (quote.projects?.clients) {
      const client = quote.projects.clients;
      doc.setFillColor(lightGray);
      doc.roundedRect(15, yPos, 180, 40, 2, 2, "F");
      
      doc.setFontSize(fontSize + 2);
      doc.text("CLIENTE", 20, yPos + 8);
      doc.setFontSize(fontSize);
      
      doc.text(client.name, 20, yPos + 18);
      if (client.address) doc.text(client.address, 20, yPos + 28);
      const fiscalInfo = [];
      if (client.vat_number) fiscalInfo.push(`P.IVA: ${client.vat_number}`);
      if (client.tax_code) fiscalInfo.push(`C.F.: ${client.tax_code}`);
      doc.text(fiscalInfo.join(" - "), 20, yPos + 38);
      
      yPos += 50;
    }

    const tableRows = quote.quote_items.map((item: any) => [
      item.description,
      item.quantity,
      `€${item.unit_price.toFixed(2)}`,
      `${item.vat_rate}%`,
      `€${(item.quantity * item.unit_price * (1 + item.vat_rate / 100)).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos + 10,
      head: [["Descrizione", "Quantità", "Prezzo Unit.", "IVA", "Totale"]],
      body: tableRows,
      theme: "grid",
      headStyles: { 
        fillColor: [155, 135, 245],
        textColor: 255,
        fontSize: fontSize + 2,
        fontStyle: "bold",
        cellPadding: 8,
      },
      bodyStyles: {
        fontSize: fontSize,
        cellPadding: 6,
      },
      alternateRowStyles: {
        fillColor: [241, 240, 251],
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 30, halign: "right" },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(primaryColor);
    doc.roundedRect(120, finalY, 75, 15, 2, 2, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(fontSize + 2);
    doc.text(`Totale: €${quote.total_amount.toFixed(2)}`, 125, finalY + 10);

    if (quote.footer_text) {
      doc.setTextColor(secondaryColor);
      doc.setFontSize(fontSize);
      doc.setFillColor(lightGray);
      doc.roundedRect(15, finalY + 25, 180, 20, 2, 2, "F");
      doc.text(quote.footer_text, 20, finalY + 35, {
        maxWidth: 170,
      });
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
