
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/ui/editor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CompanySettings } from "./CompanySettings";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("quote_templates").upsert({
        logo_url: logoUrl,
        footer_text: footerText,
        font_size: fontSize,
        name: "default",
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote_template"] });
      toast({
        title: "Template salvato",
        description: "Il template è stato salvato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: template } = useQuery({
    queryKey: ["quote_template"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_templates")
        .select()
        .eq("name", "default")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (template) {
      onLogoUrlChange(template.logo_url || "");
      onFooterTextChange(template.footer_text || "");
      onFontSizeChange(template.font_size || "medium");
    }
  }, [template, onLogoUrlChange, onFooterTextChange, onFontSizeChange]);

  const handleChange = (field: "logo_url" | "footer_text" | "font_size", value: string) => {
    switch (field) {
      case "logo_url":
        onLogoUrlChange(value);
        break;
      case "footer_text":
        onFooterTextChange(value);
        break;
      case "font_size":
        onFontSizeChange(value);
        break;
    }
    saveTemplateMutation.mutate();
  };

  return (
    <div className="space-y-8">
      <CompanySettings 
        onCompanySettingsChange={() => {
          // Aggiorniamo il template quando cambiano le impostazioni dell'azienda
          saveTemplateMutation.mutate();
        }} 
      />
      
      <div className="space-y-4">
        <h3 className="font-medium">Personalizzazione Preventivo</h3>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="logo">URL Logo</Label>
            <Input
              id="logo"
              value={logoUrl}
              onChange={(e) => handleChange("logo_url", e.target.value)}
              placeholder="Inserisci l'URL del logo..."
            />
          </div>
          <div>
            <Label htmlFor="fontSize">Dimensione Font</Label>
            <Select 
              value={fontSize} 
              onValueChange={(value) => handleChange("font_size", value)}
            >
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
              onChange={(value) => handleChange("footer_text", value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
