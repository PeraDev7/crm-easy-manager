
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, ArrowRight, Pencil, Trash2, Search } from "lucide-react";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { format } from "date-fns";

type Quote = {
  id: string;
  number: string;
  date: string;
  valid_until: string | null;
  total_amount: number;
  status: string;
  project_id: string | null;
  projects?: {
    name: string;
  };
  clients?: {
    name: string;
  };
};

const Quotes = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
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
            client_id,
            clients (
              name
            )
          )
        `);
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
    mutationFn: async (values: {
      project_id: string;
      number: string;
      valid_until?: string;
    }) => {
      const { error } = await supabase.from("quotes").insert({
        ...values,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
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

  const convertToInvoiceMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data: quote } = await supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("id", quoteId)
        .single();

      if (!quote) throw new Error("Preventivo non trovato");

      // Creiamo la fattura
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          project_id: quote.project_id,
          number: `INV-${quote.number}`,
          total_amount: quote.total_amount,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Copiamo le voci del preventivo nella fattura
      if (quote.quote_items) {
        const invoiceItems = quote.quote_items.map((item: any) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          vat_rate: item.vat_rate,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      // Aggiorniamo il preventivo con il riferimento alla fattura
      const { error: updateError } = await supabase
        .from("quotes")
        .update({ converted_to_invoice: invoice.id, status: "accepted" })
        .eq("id", quoteId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Preventivo convertito",
        description: "Il preventivo è stato convertito in fattura con successo",
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

  const filteredQuotes = quotes?.filter((quote) =>
    quote.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search">Cerca preventivo</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Cerca per numero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div>Caricamento...</div>
        ) : (
          <div className="grid gap-4">
            {filteredQuotes?.map((quote) => (
              <Card key={quote.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">
                          Preventivo #{quote.number}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            quote.status
                          )}`}
                        >
                          {quote.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Progetto: {quote.projects?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {quote.projects?.clients?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data: {format(new Date(quote.date), "dd/MM/yyyy")}
                      </p>
                      <p className="text-sm font-medium">
                        Totale: €{quote.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {quote.status === "sent" && (
                        <Button
                          onClick={() => convertToInvoiceMutation.mutate(quote.id)}
                          variant="default"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Converti in Fattura
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nuovo Preventivo</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project">Progetto</Label>
                <Select
                  onValueChange={(value) =>
                    createQuoteMutation.mutate({
                      project_id: value,
                      number: `Q-${Math.floor(Math.random() * 10000)}`,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un progetto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} - {project.clients?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default Quotes;
