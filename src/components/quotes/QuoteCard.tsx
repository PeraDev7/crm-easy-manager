
import { format } from "date-fns";
import { FileText, Pencil, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

interface QuoteCardProps {
  quote: {
    id: string;
    number: string;
    date: string;
    status: string;
    total_amount: number;
    projects?: {
      name: string;
      clients?: {
        name: string;
      };
    };
  };
  onConvert: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function QuoteCard({ quote, onConvert, onEdit, onDelete, onDownload }: QuoteCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">
                Preventivo #{quote.number}
              </h3>
              <StatusBadge status={quote.status} type="quote" />
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
                onClick={() => onConvert(quote.id)}
                variant="default"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Converti in Fattura
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onDownload(quote.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(quote.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(quote.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
