
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Editor } from "@/components/ui/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Trash2 } from "lucide-react";

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

interface CreateQuoteFormProps {
  projectId: string;
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
      project_id: projectId,
      items,
      footer_text: footerText,
      font_size: fontSize,
      logo_url: logoUrl,
      total_amount: calculateTotal(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="logo">URL Logo</Label>
            <Input
              id="logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Inserisci l'URL del logo..."
            />
          </div>
          <div>
            <Label htmlFor="fontSize">Dimensione Font</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona dimensione font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Piccolo</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Servizi</h3>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Servizio
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid gap-4 p-4 border rounded-lg">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Descrizione</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
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
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label>Prezzo Unitario</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(index, "unit_price", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label>IVA %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.vat_rate}
                      onChange={(e) =>
                        updateItem(index, "vat_rate", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-self-end"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Rimuovi
                </Button>
              )}
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="footerText">Testo in calce</Label>
          <Editor
            value={footerText}
            onChange={setFooterText}
            className="min-h-[100px]"
          />
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
