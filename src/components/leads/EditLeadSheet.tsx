
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

interface EditLeadSheetProps {
  lead: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    status: string;
    source?: string;
    estimated_value: number;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export function EditLeadSheet({
  lead,
  isOpen,
  onOpenChange,
  onSubmit,
  onDelete,
}: EditLeadSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "",
    source: "",
    estimated_value: "",
  });

  useEffect(() => {
    setFormData({
      name: lead.name,
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      status: lead.status,
      source: lead.source || "",
      estimated_value: lead.estimated_value.toString(),
    });
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(lead.id, {
      ...formData,
      estimated_value: parseFloat(formData.estimated_value),
    });
  };

  const handleDelete = () => {
    if (window.confirm("Sei sicuro di voler eliminare questo lead?")) {
      onDelete(lead.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Modifica Lead</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Azienda</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="status">Stato</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nuovo contatto</SelectItem>
                <SelectItem value="contacted">Contattato</SelectItem>
                <SelectItem value="negotiating">Negoziazione</SelectItem>
                <SelectItem value="won">Vinto</SelectItem>
                <SelectItem value="lost">Perso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Fonte</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="estimated_value">Valore stimato (€)</Label>
            <Input
              id="estimated_value"
              type="number"
              min="0"
              step="0.01"
              value={formData.estimated_value}
              onChange={(e) =>
                setFormData({ ...formData, estimated_value: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Salva</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="px-3"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
