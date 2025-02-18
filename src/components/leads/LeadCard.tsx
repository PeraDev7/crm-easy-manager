import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const statusColors = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  negotiating: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500"
};
const statusLabels = {
  new: "Nuovo contatto",
  contacted: "Contattato",
  negotiating: "Negoziazione",
  won: "Vinto",
  lost: "Perso"
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
export function LeadCard({
  lead,
  onEdit,
  onDelete,
  onAddNote
}: LeadCardProps) {
  return <Card className="hover:shadow-md transition-shadow duration-200 w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold leading-none">
              {lead.name}
            </CardTitle>
            {lead.company && <p className="text-sm text-muted-foreground leading-none">
                {lead.company}
              </p>}
          </div>
          <Badge className={`${statusColors[lead.status]} ml-auto`}>
            {statusLabels[lead.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {lead.email && <div className="flex items-center text-sm">
              <span className="text-muted-foreground min-w-[4rem]">Email:</span>
              <span className="font-medium truncate">{lead.email}</span>
            </div>}
          {lead.phone && <div className="flex items-center text-sm">
              <span className="text-muted-foreground min-w-[4rem]">Tel:</span>
              <span className="font-medium">{lead.phone}</span>
            </div>}
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground min-w-[4rem]">Valore:</span>
            <span className="font-medium">
              €{(lead.estimated_value || 0).toLocaleString('it-IT', {
              minimumFractionDigits: 2
            })}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(lead.id)} className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Modifica
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddNote(lead.id)} className="flex-1">
            <MessageSquare className="h-4 w-4 mr-1" />
            Note
          </Button>
          
        </div>
      </CardContent>
    </Card>;
}