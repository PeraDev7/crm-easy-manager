
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

interface QuoteItemsListProps {
  items: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
}

export function QuoteItemsList({ items, onItemsChange }: QuoteItemsListProps) {
  const handleAddItem = () => {
    onItemsChange([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Voci del Preventivo</h3>
        <Button type="button" variant="outline" onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Voce
        </Button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Input
              placeholder="Descrizione"
              value={item.description}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].description = e.target.value;
                onItemsChange(newItems);
              }}
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="Quantità"
              value={item.quantity}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].quantity = Number(e.target.value);
                onItemsChange(newItems);
              }}
            />
          </div>
          <div className="col-span-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Prezzo"
              value={item.unit_price}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].unit_price = Number(e.target.value);
                onItemsChange(newItems);
              }}
            />
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(index)}
              disabled={items.length === 1}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
