import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type CompanySettingsForm = {
  business_name: string;
  vat_number: string;
  tax_code: string;
  address: string;
  zip_code: string;
  city: string;
  province: string;
  country: string;
  email: string;
  pec: string;
  phone: string;
  sdi: string;
};

export default function QuotesSettings() {
  const { toast } = useToast();
  const form = useForm<CompanySettingsForm>();

  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = async (data: CompanySettingsForm) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      if (settings) {
        // Update
        const { error } = await supabase
          .from("company_settings")
          .update(data)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("company_settings")
          .insert([{ ...data, created_by: user.id }]);

        if (error) throw error;
      }

      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni aziendali sono state salvate con successo.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio delle impostazioni.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Impostazioni Preventivi</h2>
          <p className="text-muted-foreground">
            Gestisci i dati aziendali che verranno utilizzati nei preventivi
          </p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Dati Aziendali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Ragione Sociale</Label>
                  <Input 
                    id="business_name"
                    {...form.register("business_name")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vat_number">Partita IVA</Label>
                  <Input 
                    id="vat_number"
                    {...form.register("vat_number")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_code">Codice Fiscale</Label>
                  <Input 
                    id="tax_code"
                    {...form.register("tax_code")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Indirizzo</Label>
                  <Input 
                    id="address"
                    {...form.register("address")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">CAP</Label>
                  <Input 
                    id="zip_code"
                    {...form.register("zip_code")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Città</Label>
                  <Input 
                    id="city"
                    {...form.register("city")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Provincia</Label>
                  <Input 
                    id="province"
                    {...form.register("province")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Paese</Label>
                  <Input 
                    id="country"
                    {...form.register("country")}
                    defaultValue="IT"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    {...form.register("email")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pec">PEC</Label>
                  <Input 
                    id="pec"
                    {...form.register("pec")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input 
                    id="phone"
                    {...form.register("phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sdi">Codice SDI</Label>
                  <Input 
                    id="sdi"
                    {...form.register("sdi")}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Salva Impostazioni
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
