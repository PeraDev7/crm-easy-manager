
import { Download, Edit, FileText, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface QuoteActionsProps {
  quoteId: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  status: "draft" | "sent" | "accepted" | "rejected";
  clientEmail?: string;
  clientName?: string;
  quoteNumber: string;
}

export function QuoteActions({
  quoteId,
  onView,
  onEdit,
  onDelete,
  onDownload,
  status,
  clientEmail,
  clientName,
  quoteNumber,
}: QuoteActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: "draft" | "sent" | "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: newStatus })
        .eq("id", quoteId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Stato aggiornato",
        description: "Lo stato del preventivo è stato aggiornato con successo.",
      });
    } catch (error) {
      console.error("Error updating quote status:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!clientEmail) {
      toast({
        title: "Errore",
        description: "L'email del cliente non è disponibile.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prima genera il PDF
      onDownload();

      // Invia l'email
      const { error } = await supabase.functions.invoke("send-quote", {
        body: {
          quoteId,
          clientEmail,
          clientName: clientName || "Cliente",
          quoteNumber,
          pdfUrl: "URL_DEL_PDF", // Questo dovrà essere implementato
        },
      });

      if (error) throw error;

      toast({
        title: "Email inviata",
        description: "Il preventivo è stato inviato con successo.",
      });

      // Aggiorna lo stato del preventivo
      await handleStatusChange("sent");
    } catch (error) {
      console.error("Error sending quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio del preventivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDownload()}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onView()}
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit()}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={!clientEmail}
            title={clientEmail ? "Invia preventivo" : "Email cliente non disponibile"}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSendEmail}>
            Invia per email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("accepted")}>
            Segna come accettato
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
            Segna come rifiutato
          </DropdownMenuItem>
          {(status === "sent" || status === "accepted" || status === "rejected") && (
            <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
              Riporta a bozza
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete()}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
