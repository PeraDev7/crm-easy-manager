
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuoteForm } from "./QuoteForm";

interface EditQuoteSheetProps {
  quoteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export function EditQuoteSheet({ quoteId, open, onOpenChange }: EditQuoteSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quote } = useQuery({
    queryKey: ["quote", quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      const { data: quote, error } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", quoteId)
        .single();
      
      if (error) throw error;
      return quote;
    },
    enabled: !!quoteId,
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (
    values: any, 
    items: QuoteItem[], 
    totals: { subtotal: number; taxAmount: number; total: number; taxEnabled: boolean }
  ) => {
    try {
      if (!quoteId) return;

      // Validate items
      if (!items.every(item => item.description.trim())) {
        toast({
          title: "Errore",
          description: "La descrizione è obbligatoria per tutte le voci",
          variant: "destructive",
        });
        return;
      }

      // Update quote
      const { error: quoteError } = await supabase
        .from("quotes")
        .update({
          client_id: values.client_id,
          date: values.date,
          expiry_date: values.expiry_date || null,
          notes: values.notes,
          subtotal: totals.subtotal,
          tax_rate: totals.taxEnabled ? 22 : 0,
          tax_amount: totals.taxAmount,
          total: totals.total,
        })
        .eq("id", quoteId);

      if (quoteError) throw quoteError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", quoteId);

      if (deleteError) throw deleteError;

      // Create new items
      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(
          items.map((item) => ({
            quote_id: quoteId,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.quantity * item.unit_price,
          }))
        );

      if (itemsError) throw itemsError;

      toast({
        title: "Preventivo aggiornato",
        description: "Il preventivo è stato aggiornato con successo.",
      });

      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", quoteId] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del preventivo.",
        variant: "destructive",
      });
    }
  };

  if (!quote) return null;

  const defaultValues = {
    client_id: quote.client_id,
    date: quote.date,
    expiry_date: quote.expiry_date || "",
    notes: quote.notes || "",
  };

  const initialItems = quote.quote_items.map((item: any) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-5xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Modifica Preventivo {quote.quote_number}</SheetTitle>
        </SheetHeader>

        <QuoteForm
          clients={clients}
          lastQuoteNumber={quote.quote_number}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          initialItems={initialItems}
          initialTaxEnabled={quote.tax_rate > 0}
        />
      </SheetContent>
    </Sheet>
  );
}
