
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/ui/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuoteOptionsProps {
  logoUrl: string;
  fontSize: string;
  footerText: string;
  onLogoUrlChange: (value: string) => void;
  onFontSizeChange: (value: string) => void;
  onFooterTextChange: (value: string) => void;
}

export function QuoteOptions({
  logoUrl,
  fontSize,
  footerText,
  onLogoUrlChange,
  onFontSizeChange,
  onFooterTextChange,
}: QuoteOptionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Personalizzazione</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="logo">URL Logo</Label>
          <Input
            id="logo"
            value={logoUrl}
            onChange={(e) => onLogoUrlChange(e.target.value)}
            placeholder="Inserisci l'URL del logo..."
          />
        </div>
        <div>
          <Label htmlFor="fontSize">Dimensione Font</Label>
          <Select value={fontSize} onValueChange={onFontSizeChange}>
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
        <div>
          <Label htmlFor="footerText">Testo in calce</Label>
          <Editor
            value={footerText}
            onChange={onFooterTextChange}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}
