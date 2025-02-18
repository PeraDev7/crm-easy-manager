
interface QuoteTotalsProps {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function QuoteTotals({ subtotal, taxAmount, total }: QuoteTotalsProps) {
  return (
    <div className="mt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotale:</span>
        <span>€ {subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>IVA (22%):</span>
        <span>€ {taxAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-medium">
        <span>Totale:</span>
        <span>€ {total.toFixed(2)}</span>
      </div>
    </div>
  );
}
