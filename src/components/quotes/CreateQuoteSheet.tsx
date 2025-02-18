
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

interface CreateQuoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export function CreateQuoteSheet({ open, onOpenChange }: CreateQuoteSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: lastQuoteNumber } = useQuery({
    queryKey: ["lastQuoteNumber"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("quote_number")
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].quote_number.split("-")[1]);
        if (isNaN(lastNumber)) {
          return "PRE-001";
        }
        return `PRE-${String(lastNumber + 1).padStart(3, "0")}`;
      }
      return "PRE-001";
    },
  });

  const handleSubmit = async (
    values: any, 
    items: QuoteItem[], 
    totals: { subtotal: number; taxAmount: number; total: number; taxEnabled: boolean }
  ) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      if (!lastQuoteNumber) {
        toast({
          title: "Errore",
          description: "Errore nella generazione del numero preventivo",
          variant: "destructive",
        });
        return;
      }

      // Validate items
      if (!items.every(item => item.description.trim())) {
        toast({
          title: "Errore",
          description: "La descrizione è obbligatoria per tutte le voci",
          variant: "destructive",
        });
        return;
      }

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          client_id: values.client_id,
          quote_number: lastQuoteNumber,
          date: values.date,
          expiry_date: values.expiry_date || null,
          notes: values.notes,
          created_by: user.id,
          subtotal: totals.subtotal,
          tax_rate: totals.taxEnabled ? 22 : 0,
          tax_amount: totals.taxAmount,
          total: totals.total,
          status: "draft",
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items
      const { error: itemsError } = await supabase.from("quote_items").insert(
        items.map((item) => ({
          quote_id: quote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
        }))
      );

      if (itemsError) throw itemsError;

      toast({
        title: "Preventivo creato",
        description: "Il preventivo è stato creato con successo.",
      });

      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["lastQuoteNumber"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del preventivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-5xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuovo Preventivo</SheetTitle>
        </SheetHeader>

        <QuoteForm
          clients={clients}
          lastQuoteNumber={lastQuoteNumber}
          onSubmit={handleSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}
