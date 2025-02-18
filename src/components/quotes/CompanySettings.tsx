
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanySettingsProps {
  onCompanySettingsChange: (settings: any) => void;
}

export function CompanySettings({ onCompanySettingsChange }: CompanySettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveSettingsMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("company_settings")
        .upsert({
          company_name: values.company_name,
          address: values.address,
          city: values.city,
          postal_code: values.postal_code,
          vat_number: values.vat_number,
          tax_code: values.tax_code,
          email: values.email,
          phone: values.phone,
          pec: values.pec,
          sdi: values.sdi,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company_settings"] });
      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni dell'azienda sono state salvate con successo",
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

  const { data: settings } = useQuery({
    queryKey: ["company_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      onCompanySettingsChange(settings);
    }
  }, [settings, onCompanySettingsChange]);

  const handleChange = (field: string, value: string) => {
    const newSettings = {
      ...settings,
      [field]: value,
    };
    saveSettingsMutation.mutate(newSettings);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Informazioni Aziendali</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="company_name">Nome Azienda</Label>
          <Input
            id="company_name"
            value={settings?.company_name || ""}
            onChange={(e) => handleChange("company_name", e.target.value)}
            placeholder="Nome azienda..."
          />
        </div>
        <div>
          <Label htmlFor="address">Indirizzo</Label>
          <Input
            id="address"
            value={settings?.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Indirizzo..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Città</Label>
            <Input
              id="city"
              value={settings?.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Città..."
            />
          </div>
          <div>
            <Label htmlFor="postal_code">CAP</Label>
            <Input
              id="postal_code"
              value={settings?.postal_code || ""}
              onChange={(e) => handleChange("postal_code", e.target.value)}
              placeholder="CAP..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vat_number">Partita IVA</Label>
            <Input
              id="vat_number"
              value={settings?.vat_number || ""}
              onChange={(e) => handleChange("vat_number", e.target.value)}
              placeholder="Partita IVA..."
            />
          </div>
          <div>
            <Label htmlFor="tax_code">Codice Fiscale</Label>
            <Input
              id="tax_code"
              value={settings?.tax_code || ""}
              onChange={(e) => handleChange("tax_code", e.target.value)}
              placeholder="Codice fiscale..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings?.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email..."
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              value={settings?.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Telefono..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pec">PEC</Label>
            <Input
              id="pec"
              value={settings?.pec || ""}
              onChange={(e) => handleChange("pec", e.target.value)}
              placeholder="PEC..."
            />
          </div>
          <div>
            <Label htmlFor="sdi">Codice SDI</Label>
            <Input
              id="sdi"
              value={settings?.sdi || ""}
              onChange={(e) => handleChange("sdi", e.target.value)}
              placeholder="Codice SDI..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
