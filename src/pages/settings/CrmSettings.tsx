
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CrmSettings {
  id: string;
  created_at: string;
  created_by: string;
  app_name: string;
}

interface Profile {
  id: string;
  avatar_url: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  notes: string | null;
  primary_color: string;
}

const colorOptions = [
  { value: '#0EA5E9', class: 'bg-[#0EA5E9]' },
  { value: '#ea384c', class: 'bg-[#ea384c]' },
  { value: '#8B5CF6', class: 'bg-[#8B5CF6]' },
  { value: '#F97316', class: 'bg-[#F97316]' },
  { value: '#9b87f5', class: 'bg-[#9b87f5]' },
];

type FormValues = {
  app_name: string;
  primary_color: string;
};

export default function CrmSettings() {
  const { toast } = useToast();
  const form = useForm<FormValues>();

  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ["crm-settings"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("crm_settings")
        .select("*")
        .eq("created_by", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CrmSettings;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  React.useEffect(() => {
    if (settings && profile) {
      form.reset({
        app_name: settings.app_name,
        primary_color: profile.primary_color,
      });
    } else if (!settings && profile) {
      form.reset({
        app_name: "CRM",
        primary_color: profile.primary_color,
      });
    }
  }, [settings, profile, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      // Prima verifichiamo se esiste già un record per questo utente
      const { data: existingSettings } = await supabase
        .from("crm_settings")
        .select("id")
        .eq("created_by", user.id)
        .maybeSingle();

      if (existingSettings) {
        // Aggiorniamo il record esistente
        const { error: updateError } = await supabase
          .from("crm_settings")
          .update({
            app_name: data.app_name
          })
          .eq("created_by", user.id);

        if (updateError) throw updateError;
      } else {
        // Creiamo un nuovo record
        const { error: insertError } = await supabase
          .from("crm_settings")
          .insert({
            app_name: data.app_name,
            created_by: user.id
          });

        if (insertError) throw insertError;
      }

      // Aggiorna il colore primario nel profilo utente
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          primary_color: data.primary_color
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      await refetchSettings();

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

                <div className="space-y-2">
                  <Label>Colore Primario</Label>
                  <RadioGroup
                    onValueChange={(value) => form.setValue("primary_color", value)}
                    value={form.watch("primary_color")}
                    className="flex gap-4 items-center"
                  >
                    {colorOptions.map((color) => (
                      <div key={color.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={color.value} id={color.value} />
                        <Label 
                          htmlFor={color.value}
                          className="cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-full ${color.class}`} />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
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
