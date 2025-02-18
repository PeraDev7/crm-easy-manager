
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CreateQuoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

const formSchema = z.object({
  client_id: z.string().min(1, "Il cliente è obbligatorio"),
  quote_number: z.string().min(1, "Il numero preventivo è obbligatorio"),
  date: z.string().min(1, "La data è obbligatoria"),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof formSchema>;

export function CreateQuoteSheet({ open, onOpenChange }: CreateQuoteSheetProps) {
  const [items, setItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, total: 0 });
  
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: "",
      quote_number: "",
      date: new Date().toISOString().split("T")[0],
      expiry_date: "",
      notes: "",
    },
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

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = (items: QuoteItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxRate = 22;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  // Aggiorniamo i totali quando cambiano gli items
  useEffect(() => {
    setTotals(calculateTotals(items));
  }, [items]);

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

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
          quote_number: values.quote_number,
          date: values.date,
          expiry_date: values.expiry_date || null,
          notes: values.notes,
          created_by: user.id,
          subtotal: totals.subtotal,
          tax_rate: 22,
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
      onOpenChange(false);
      form.reset();
      setItems([{ description: "", quantity: 1, unit_price: 0 }]);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.business_name || client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quote_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero Preventivo</FormLabel>
                    <FormControl>
                      <Input placeholder="es. PRE-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Scadenza (opzionale)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Voci del Preventivo</h3>
                <Button type="button" variant="outline" onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Voce
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <Input
                      placeholder="Descrizione"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].description = e.target.value;
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Quantità"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = Number(e.target.value);
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Prezzo"
                      value={item.unit_price}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].unit_price = Number(e.target.value);
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotale:</span>
                  <span>€ {totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (22%):</span>
                  <span>€ {totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Totale:</span>
                  <span>€ {totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Note aggiuntive..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Crea Preventivo</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
