
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

interface QuoteItemFormProps {
  item: QuoteItem;
  onUpdate: (field: keyof QuoteItem, value: any) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function QuoteItemForm({
  item,
  onUpdate,
  onRemove,
  showRemove = false,
}: QuoteItemFormProps) {
  return (
    <div className="grid gap-4 p-4 border rounded-lg">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Descrizione</Label>
          <Input
            value={item.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            placeholder="Descrizione del servizio..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Quantità</Label>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onUpdate("quantity", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Prezzo Unitario</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={(e) => onUpdate("unit_price", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>IVA %</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={item.vat_rate}
              onChange={(e) => onUpdate("vat_rate", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      {showRemove && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-self-end"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Rimuovi
        </Button>
      )}
    </div>
  );
}
