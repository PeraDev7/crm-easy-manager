
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  negotiating: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

const statusLabels = {
  new: "Nuovo contatto",
  contacted: "Contattato",
  negotiating: "Negoziazione",
  won: "Vinto",
  lost: "Perso",
};

interface LeadCardProps {
  lead: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    status: keyof typeof statusColors;
    estimated_value?: number;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNote: (id: string) => void;
}

export function LeadCard({ lead, onEdit, onDelete, onAddNote }: LeadCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{lead.name}</CardTitle>
        <Badge className={statusColors[lead.status]}>
          {statusLabels[lead.status]}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lead.company && (
            <p className="text-sm text-muted-foreground">
              Azienda: {lead.company}
            </p>
          )}
          {lead.email && (
            <p className="text-sm text-muted-foreground">
              Email: {lead.email}
            </p>
          )}
          {lead.phone && (
            <p className="text-sm text-muted-foreground">
              Telefono: {lead.phone}
            </p>
          )}
          <p className="text-sm font-medium">
            Valore stimato: €{(lead.estimated_value || 0).toFixed(2)}
          </p>
          
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => onEdit(lead.id)}>
              <Edit className="h-4 w-4 mr-1" />
              Modifica
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAddNote(lead.id)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Note
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(lead.id)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Elimina
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
