
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { FileText, Download, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { EditQuoteSheet } from "./EditQuoteSheet";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusMap = {
  draft: { label: "Bozza", variant: "secondary" },
  sent: { label: "Inviato", variant: "default" },
  accepted: { label: "Accettato", variant: "default" },
  rejected: { label: "Rifiutato", variant: "destructive" },
} as const;

type Quote = {
  id: string;
  quote_number: string;
  date: string;
  total: number;
  status: keyof typeof statusMap;
  client: {
    id: string;
    name: string;
    business_name: string | null;
  } | null;
};

interface QuotesListProps {
  quotes: Quote[];
}

export function QuotesList({ quotes }: QuotesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [editQuoteId, setEditQuoteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      // Delete quote items first
      const { error: itemsError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", id);

      if (itemsError) throw itemsError;

      // Then delete the quote
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

  const handleDownload = (id: string) => {
    // TODO: Implementare il download del PDF
    console.log("Download quote", id);
  };

  return (
    <>
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
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>{quote.quote_number}</TableCell>
                <TableCell>
                  {quote.client?.business_name || quote.client?.name || "N/D"}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(quote.date), {
                    addSuffix: true,
                    locale: it,
                  })}
                </TableCell>
                <TableCell>€ {quote.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={statusMap[quote.status].variant}>
                    {statusMap[quote.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(quote.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditQuoteId(quote.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setQuoteToDelete(quote.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il preventivo verrà eliminato permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuoteToDelete(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (quoteToDelete) {
                  handleDelete(quoteToDelete);
                  setQuoteToDelete(null);
                }
                setDeleteDialogOpen(false);
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditQuoteSheet
        quoteId={editQuoteId}
        open={!!editQuoteId}
        onOpenChange={(open) => {
          if (!open) setEditQuoteId(null);
        }}
      />
    </>
  );
}
