
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["company_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (values: any) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("company_settings")
        .upsert({
          ...values,
          created_by: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Impostazioni salvate",
        description: "Le impostazioni aziendali sono state salvate con successo",
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    updateSettings.mutate(values);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Impostazioni</h1>
        </div>

        <Tabs defaultValue="company">
          <TabsList>
            <TabsTrigger value="company">Azienda</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Dati Aziendali</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nome Azienda</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        defaultValue={settings?.company_name}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Indirizzo</Label>
                      <Input
                        id="address"
                        name="address"
                        defaultValue={settings?.address}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Città</Label>
                      <Input
                        id="city"
                        name="city"
                        defaultValue={settings?.city}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">CAP</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        defaultValue={settings?.postal_code}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vat_number">Partita IVA</Label>
                      <Input
                        id="vat_number"
                        name="vat_number"
                        defaultValue={settings?.vat_number}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_code">Codice Fiscale</Label>
                      <Input
                        id="tax_code"
                        name="tax_code"
                        defaultValue={settings?.tax_code}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={settings?.email}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={settings?.phone}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Sito Web</Label>
                      <Input
                        id="website"
                        name="website"
                        defaultValue={settings?.website}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pec">PEC</Label>
                      <Input
                        id="pec"
                        name="pec"
                        defaultValue={settings?.pec}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sdi">Codice SDI</Label>
                      <Input
                        id="sdi"
                        name="sdi"
                        defaultValue={settings?.sdi}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Salva Impostazioni
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
