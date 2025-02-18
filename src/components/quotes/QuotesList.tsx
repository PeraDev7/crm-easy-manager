
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { FileText, Download } from "lucide-react";
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

const statusMap = {
  draft: { label: "Bozza", variant: "secondary" },
  sent: { label: "Inviato", variant: "primary" },
  accepted: { label: "Accettato", variant: "success" },
  rejected: { label: "Rifiutato", variant: "destructive" },
} as const;

type Quote = {
  id: string;
  quote_number: string;
  date: string;
  total: number;
  status: keyof typeof statusMap;
  client: {
    name: string;
    business_name: string;
  } | null;
};

interface QuotesListProps {
  quotes: Quote[];
}

export function QuotesList({ quotes }: QuotesListProps) {
  const handleDownload = (id: string) => {
    // TODO: Implementare il download del PDF
    console.log("Download quote", id);
  };

  return (
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
                <Badge variant={statusMap[quote.status].variant as any}>
                  {statusMap[quote.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
