
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Settings } from "lucide-react";
import { QuoteOptions } from "./QuoteOptions";
import { QuoteItemForm } from "./QuoteItemForm";

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

interface CreateQuoteFormProps {
  projectId: string | null;  // Modifichiamo il tipo per accettare null
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CreateQuoteForm({
  projectId,
  onSubmit,
  onCancel,
}: CreateQuoteFormProps) {
  const [items, setItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unit_price: 0, vat_rate: 22 },
  ]);
  const [footerText, setFooterText] = useState("");
  const [fontSize, setFontSize] = useState("medium");
  const [logoUrl, setLogoUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unit_price: 0, vat_rate: 22 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const vatAmount = (itemTotal * item.vat_rate) / 100;
      return total + itemTotal + vatAmount;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((item) => !item.description)) {
      toast({
        title: "Errore",
        description: "Inserisci una descrizione per tutti i servizi",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      project_id: projectId,  // Ora può essere null
      items,
      footer_text: footerText,
      font_size: fontSize,
      logo_url: logoUrl,
      total_amount: calculateTotal(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Opzioni Preventivo
        </Button>

        {showOptions && (
          <div className="p-4 border rounded-lg bg-muted/30">
            <QuoteOptions
              logoUrl={logoUrl}
              fontSize={fontSize}
              footerText={footerText}
              onLogoUrlChange={setLogoUrl}
              onFontSizeChange={setFontSize}
              onFooterTextChange={setFooterText}
            />
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Servizi</h3>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Servizio
            </Button>
          </div>

          {items.map((item, index) => (
            <QuoteItemForm
              key={index}
              item={item}
              onUpdate={(field, value) => updateItem(index, field, value)}
              onRemove={() => removeItem(index)}
              showRemove={items.length > 1}
            />
          ))}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-lg font-medium">
            Totale: €{calculateTotal().toFixed(2)}
          </div>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              <FileText className="w-4 h-4 mr-2" />
              Crea Preventivo
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
