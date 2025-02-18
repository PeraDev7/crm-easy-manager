
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { QuoteItemsList } from "./QuoteItemsList";
import { QuoteTotals } from "./QuoteTotals";
import { useState, useEffect } from "react";

const formSchema = z.object({
  client_id: z.string().min(1, "Il cliente è obbligatorio"),
  date: z.string().min(1, "La data è obbligatoria"),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof formSchema>;

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

interface QuoteFormProps {
  clients?: any[];
  lastQuoteNumber?: string;
  onSubmit: (values: QuoteFormValues, items: QuoteItem[], totals: { subtotal: number; taxAmount: number; total: number; taxEnabled: boolean }) => void;
  defaultValues?: QuoteFormValues;
  initialItems?: QuoteItem[];
  initialTaxEnabled?: boolean;
}

export function QuoteForm({ 
  clients, 
  lastQuoteNumber, 
  onSubmit,
  defaultValues,
  initialItems,
  initialTaxEnabled = true,
}: QuoteFormProps) {
  const [items, setItems] = useState<QuoteItem[]>(
    initialItems || [{ description: "", quantity: 1, unit_price: 0 }]
  );
  const [taxEnabled, setTaxEnabled] = useState(initialTaxEnabled);
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, total: 0 });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      client_id: "",
      date: new Date().toISOString().split("T")[0],
      expiry_date: "",
      notes: "",
    },
  });

  const calculateTotals = (items: QuoteItem[], taxEnabled: boolean) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxRate = taxEnabled ? 22 : 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  useEffect(() => {
    setTotals(calculateTotals(items, taxEnabled));
  }, [items, taxEnabled]);

  const handleSubmit = (values: QuoteFormValues) => {
    onSubmit(values, items, { ...totals, taxEnabled });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-6">
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

          <div className="space-y-2">
            <FormLabel>Numero Preventivo</FormLabel>
            <Input
              value={lastQuoteNumber || ""}
              disabled
              className="bg-muted"
            />
          </div>

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

        <QuoteItemsList items={items} onItemsChange={setItems} />
        <QuoteTotals 
          {...totals} 
          taxEnabled={taxEnabled}
          onTaxEnabledChange={setTaxEnabled}
        />

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
  );
}
