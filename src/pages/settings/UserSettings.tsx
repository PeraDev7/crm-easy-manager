
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type UserSettingsForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function UserSettings() {
  const { toast } = useToast();
  const form = useForm<UserSettingsForm>();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        form.reset({
          email: user.email,
          password: "",
          confirmPassword: "",
        });
      }
    };
    getUser();
  }, [form]);

  const onSubmit = async (data: UserSettingsForm) => {
    try {
      if (data.password && data.password !== data.confirmPassword) {
        toast({
          title: "Errore",
          description: "Le password non coincidono",
          variant: "destructive",
        });
        return;
      }

      const updates: { email?: string; password?: string } = {};
      
      if (data.email !== user?.email) {
        updates.email = data.email;
      }
      
      if (data.password) {
        updates.password = data.password;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        
        if (error) throw error;

        toast({
          title: "Impostazioni salvate",
          description: "Le impostazioni del profilo sono state aggiornate con successo.",
        });

        // Reset password fields
        form.setValue("password", "");
        form.setValue("confirmPassword", "");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento delle impostazioni.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Impostazioni Utente</h2>
          <p className="text-muted-foreground">
            Gestisci le tue impostazioni personali
          </p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Profilo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    {...form.register("email")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Nuova Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="Lascia vuoto per non modificare"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Conferma Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                    placeholder="Lascia vuoto per non modificare"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Salva Modifiche
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
