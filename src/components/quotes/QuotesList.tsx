
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { EditQuoteSheet } from "./EditQuoteSheet";
import { ViewQuoteSheet } from "./ViewQuoteSheet";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuoteTableRow } from "./QuoteTableRow";
import { DeleteQuoteDialog } from "./DeleteQuoteDialog";
import { generateQuotePDF } from "@/utils/generateQuotePDF";
import { SearchBar } from "@/components/SearchBar";

type Quote = {
  id: string;
  quote_number: string;
  date: string;
  total: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  client: {
    id: string;
    name: string;
    business_name: string | null;
    email: string | null;
  } | null;
};

interface QuotesListProps {
  quotes: Quote[];
}

export function QuotesList({ quotes }: QuotesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [editQuoteId, setEditQuoteId] = useState<string | null>(null);
  const [viewQuoteId, setViewQuoteId] = useState<string | null>(null);
  const [quoteNumberFilter, setQuoteNumberFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      const { error: itemsError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", id);

      if (itemsError) throw itemsError;

      const { error: quoteError } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id);

      if (quoteError) throw quoteError;

      toast({
        title: "Preventivo eliminato",
        description: "Il preventivo è stato eliminato con successo.",
      });

      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    } catch (error: any) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del preventivo.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select(`
          *,
          quote_items(*),
          client:clients(*)
        `)
        .eq("id", id)
        .single();
      
      if (quoteError) throw quoteError;

      const { data: companySettings, error: settingsError } = await supabase
        .from("company_settings")
        .select("*")
        .single();
      
      if (settingsError) throw settingsError;

      generateQuotePDF(quote, companySettings);
    } catch (error) {
      console.error("Error downloading quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il download del preventivo.",
        variant: "destructive",
      });
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    return quote.quote_number.toLowerCase().includes(quoteNumberFilter.toLowerCase());
  });

  return (
    <>
      <div className="space-y-4">
        <SearchBar
          label="Cerca per numero preventivo"
          placeholder="Inserisci il numero..."
          value={quoteNumberFilter}
          onChange={setQuoteNumberFilter}
        />

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Totale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <QuoteTableRow
                  key={quote.id}
                  quote={quote}
                  onView={(id) => setViewQuoteId(id)}
                  onEdit={(id) => setEditQuoteId(id)}
                  onDelete={(id) => {
                    setQuoteToDelete(id);
                    setDeleteDialogOpen(true);
                  }}
                  onDownload={handleDownload}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteQuoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (quoteToDelete) {
            handleDelete(quoteToDelete);
            setQuoteToDelete(null);
          }
          setDeleteDialogOpen(false);
        }}
        onCancel={() => {
          setQuoteToDelete(null);
          setDeleteDialogOpen(false);
        }}
      />

      <EditQuoteSheet
        quoteId={editQuoteId}
        open={!!editQuoteId}
        onOpenChange={(open) => {
          if (!open) setEditQuoteId(null);
        }}
      />

      <ViewQuoteSheet
        quoteId={viewQuoteId}
        open={!!viewQuoteId}
        onOpenChange={(open) => {
          if (!open) setViewQuoteId(null);
        }}
      />
    </>
  );
}
