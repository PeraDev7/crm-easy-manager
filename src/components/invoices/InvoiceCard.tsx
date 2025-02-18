
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

interface InvoiceCardProps {
  invoice: {
    id: string;
    number: string;
    date: string;
    due_date: string | null;
    total_amount: number;
    status: string;
    payment_status: string;
    projects?: {
      name: string;
      clients?: {
        name: string;
      };
    };
  };
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">
                Fattura #{invoice.number}
              </h3>
              <StatusBadge status={invoice.status} type="invoice" />
              <StatusBadge status={invoice.payment_status} type="payment" />
            </div>
            <p className="text-sm text-muted-foreground">
              Progetto: {invoice.projects?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Cliente: {invoice.projects?.clients?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Data: {format(new Date(invoice.date), "dd/MM/yyyy")}
            </p>
            {invoice.due_date && (
              <p className="text-sm text-muted-foreground">
                Scadenza: {format(new Date(invoice.due_date), "dd/MM/yyyy")}
              </p>
            )}
            <p className="text-sm font-medium">
              Totale: €{invoice.total_amount.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Visualizza
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
