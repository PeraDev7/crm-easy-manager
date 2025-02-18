
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ViewQuoteSheetProps {
  quoteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewQuoteSheet({ quoteId, open, onOpenChange }: ViewQuoteSheetProps) {
  const { data: quote } = useQuery({
    queryKey: ["quote", quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      const { data: quote, error } = await supabase
        .from("quotes")
        .select(`
          *,
          quote_items(*),
          client:clients(*)
        `)
        .eq("id", quoteId)
        .single();
      
      if (error) throw error;
      return quote;
    },
    enabled: !!quoteId,
  });

  const { data: companySettings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!quote || !companySettings) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-5xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Preventivo {quote.quote_number}</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Company Header */}
          <Card>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-lg">{companySettings.business_name}</h3>
                <p className="text-sm text-muted-foreground">{companySettings.address}</p>
                <p className="text-sm text-muted-foreground">
                  {companySettings.zip_code} {companySettings.city} ({companySettings.province})
                </p>
                <p className="text-sm text-muted-foreground">P.IVA: {companySettings.vat_number}</p>
                <p className="text-sm text-muted-foreground">CF: {companySettings.tax_code}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data: {format(new Date(quote.date), "dd/MM/yyyy")}</p>
                  {quote.expiry_date && (
                    <p className="text-sm font-medium">
                      Scadenza: {format(new Date(quote.expiry_date), "dd/MM/yyyy")}
                    </p>
                  )}
                  <p className="text-sm font-medium">Numero: {quote.quote_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-2">Cliente</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  {quote.client.business_name || quote.client.name}
                </p>
                {quote.client.address && (
                  <p className="text-sm text-muted-foreground">
                    {quote.client.address}
                  </p>
                )}
                {quote.client.vat_number && (
                  <p className="text-sm text-muted-foreground">
                    P.IVA: {quote.client.vat_number}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardContent className="p-6">
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Descrizione</th>
                      <th className="text-right p-2">Quantità</th>
                      <th className="text-right p-2">Prezzo</th>
                      <th className="text-right p-2">Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.quote_items.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{item.description}</td>
                        <td className="text-right p-2">{item.quantity}</td>
                        <td className="text-right p-2">€ {item.unit_price.toFixed(2)}</td>
                        <td className="text-right p-2">€ {item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-2 text-right">
                <p className="text-sm">
                  Subtotale: € {quote.subtotal.toFixed(2)}
                </p>
                {quote.tax_rate > 0 && (
                  <p className="text-sm">
                    IVA ({quote.tax_rate}%): € {quote.tax_amount.toFixed(2)}
                  </p>
                )}
                <p className="text-lg font-bold">
                  Totale: € {quote.total.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">Note</h3>
                <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
