
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface QuoteTotalsProps {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxEnabled: boolean;
  onTaxEnabledChange: (enabled: boolean) => void;
}

export function QuoteTotals({ 
  subtotal, 
  taxAmount, 
  total, 
  taxEnabled,
  onTaxEnabledChange 
}: QuoteTotalsProps) {
  return (
    <div className="mt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotale:</span>
        <span>€ {subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={taxEnabled}
            onCheckedChange={onTaxEnabledChange}
          />
          <Label>IVA (22%)</Label>
        </div>
        <span>€ {taxEnabled ? taxAmount.toFixed(2) : "0.00"}</span>
      </div>

      <div className="flex justify-between font-medium">
        <span>Totale:</span>
        <span>€ {total.toFixed(2)}</span>
      </div>
    </div>
  );
}
