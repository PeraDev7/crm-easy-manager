
import { Plus, Save, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceSelector } from "./ServiceSelector";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("description");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddItem = () => {
    onItemsChange([...items, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleSaveService = async (index: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per salvare un servizio.",
          variant: "destructive",
        });
        return;
      }

      const item = items[index];
      const { error } = await supabase.from("services").insert({
        description: item.description,
        unit_price: item.unit_price,
        created_by: user.id
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Servizio salvato",
        description: "Il servizio è stato salvato con successo.",
      });
    } catch (error) {
      console.error("Error saving service:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del servizio.",
        variant: "destructive",
      });
    }
  };

  const handleServiceSelect = (index: number, service: { description: string; unit_price: number }) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      description: service.description,
      unit_price: service.unit_price,
    };
    onItemsChange(newItems);
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
          <div className="col-span-6 space-y-2">
            <Input
              placeholder="Descrizione"
              value={item.description}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index].description = e.target.value;
                onItemsChange(newItems);
              }}
            />
            <ServiceSelector
              services={services}
              onSelect={(service) => handleServiceSelect(index, service)}
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
          <div className="col-span-1 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleSaveService(index)}
              disabled={!item.description || !item.unit_price}
              title="Salva come servizio"
            >
              <Save className="h-4 w-4" />
            </Button>
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
