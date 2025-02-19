
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuoteActions } from "./QuoteActions";

const statusMap = {
  draft: { label: "Bozza", variant: "secondary" },
  sent: { label: "Inviato", variant: "default" },
  accepted: { label: "Accettato", variant: "default" },
  rejected: { label: "Rifiutato", variant: "destructive" },
} as const;

interface QuoteTableRowProps {
  quote: {
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
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function QuoteTableRow({ 
  quote, 
  onView, 
  onEdit, 
  onDelete,
  onDownload 
}: QuoteTableRowProps) {
  return (
    <TableRow>
      <TableCell>{quote.quote_number}</TableCell>
      <TableCell>
        {quote.client?.business_name || quote.client?.name || "N/D"}
      </TableCell>
      <TableCell>
        {format(new Date(quote.date), "d MMMM yyyy", { locale: it })}
      </TableCell>
      <TableCell>€ {quote.total.toFixed(2)}</TableCell>
      <TableCell>
        <Badge variant={statusMap[quote.status].variant}>
          {statusMap[quote.status].label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <QuoteActions
          quoteId={quote.id}
          onView={() => onView(quote.id)}
          onEdit={() => onEdit(quote.id)}
          onDelete={() => onDelete(quote.id)}
          onDownload={() => onDownload(quote.id)}
        />
      </TableCell>
    </TableRow>
  );
}
