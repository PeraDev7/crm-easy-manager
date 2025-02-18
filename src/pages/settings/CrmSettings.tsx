
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface CrmSettings {
  id: string;
  created_at: string;
  created_by: string;
  app_name: string;
  dark_mode: boolean;
}

type CrmSettingsForm = Pick<CrmSettings, 'app_name' | 'dark_mode'>;

export default function CrmSettings() {
  const { toast } = useToast();
  const form = useForm<CrmSettingsForm>();

  const { data: settings } = useQuery({
    queryKey: ["crm-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as CrmSettings;
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        app_name: settings.app_name,
        dark_mode: settings.dark_mode,
      });
    } else {
      // Default values
      form.reset({
        app_name: "CRM",
        dark_mode: false,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: CrmSettingsForm) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("crm_settings")
        .upsert({
          ...data,
          created_by: user.id,
          ...(settings?.id ? { id: settings.id } : {}),
        });

      if (error) throw error;

      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni del CRM sono state salvate con successo.",
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
          <h2 className="text-2xl font-bold tracking-tight">Impostazioni CRM</h2>
          <p className="text-muted-foreground">
            Gestisci le impostazioni generali del CRM
          </p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Generali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app_name">Nome App</Label>
                  <Input 
                    id="app_name"
                    {...form.register("app_name")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark_mode">Modalità Scura</Label>
                    <p className="text-sm text-muted-foreground">
                      Abilita o disabilita la modalità scura dell'applicazione
                    </p>
                  </div>
                  <Switch
                    id="dark_mode"
                    checked={form.watch("dark_mode")}
                    onCheckedChange={(checked) => form.setValue("dark_mode", checked)}
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
