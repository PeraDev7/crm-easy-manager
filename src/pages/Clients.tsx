import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/SearchBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Tipo per il form del cliente
type ClientFormData = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  business_name: string | null;
  vat_number: string | null;
  tax_code: string | null;
  sdi: string | null;
  pec: string | null;
  billing_address: string | null;
  color: string | null;
};

// Tipo per il cliente dal database
type Client = ClientFormData & {
  id: string;
  created_at: string;
  created_by: string;
};

const Clients = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: null,
    phone: null,
    address: null,
    notes: null,
    business_name: null,
    vat_number: null,
    tax_code: null,
    sdi: null,
    pec: null,
    billing_address: null,
    color: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query per ottenere i clienti
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("clients")
        .select("*")
        .order("name");

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Client[];
    },
  });

  // Mutation per creare/aggiornare un cliente
  const mutation = useMutation({
    mutationFn: async (client: ClientFormData) => {
      if (editingClient) {
        const { data, error } = await supabase
          .from("clients")
          .update(client)
          .eq("id", editingClient.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("clients")
          .insert([{ ...client, created_by: (await supabase.auth.getUser()).data.user?.id }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: editingClient ? "Cliente aggiornato" : "Cliente creato",
        description: editingClient
          ? "Il cliente è stato aggiornato con successo"
          : "Il nuovo cliente è stato creato con successo",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation per eliminare un cliente
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Cliente eliminato",
        description: "Il cliente è stato eliminato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      business_name: client.business_name,
      vat_number: client.vat_number,
      tax_code: client.tax_code,
      sdi: client.sdi,
      pec: client.pec,
      billing_address: client.billing_address,
      color: client.color,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo cliente?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingClient(null);
    setFormData({
      name: "",
      email: null,
      phone: null,
      address: null,
      notes: null,
      business_name: null,
      vat_number: null,
      tax_code: null,
      sdi: null,
      pec: null,
      billing_address: null,
      color: null,
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clienti</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Nuovo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          label="Cerca clienti"
          placeholder="Cerca per nome, email o ragione sociale..."
        />
      </div>

      {isLoading ? (
        <div>Caricamento...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              {client.color && (
                <div 
                  className="absolute top-0 left-0 w-1 h-full" 
                  style={{ backgroundColor: client.color }}
                />
              )}
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{client.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(client)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {client.business_name || client.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {client.phone && <p>📞 {client.phone}</p>}
                  {client.address && <p>📍 {client.address}</p>}
                  {client.vat_number && <p>🏢 P.IVA: {client.vat_number}</p>}
                  {client.pec && <p>📧 PEC: {client.pec}</p>}
                  {client.notes && <p>📝 {client.notes}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingClient ? "Modifica Cliente" : "Nuovo Cliente"}
            </SheetTitle>
            <SheetDescription>
              {editingClient
                ? "Modifica i dettagli del cliente"
                : "Aggiungi un nuovo cliente"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informazioni Generali</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nome del cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value || null })
                  }
                  placeholder="Email del cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefono</label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value || null })
                  }
                  placeholder="Numero di telefono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Indirizzo</label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value || null })
                  }
                  placeholder="Indirizzo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Colore</label>
                <Input
                  type="color"
                  value={formData.color || "#000000"}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dati di Fatturazione</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ragione Sociale</label>
                <Input
                  value={formData.business_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value || null })
                  }
                  placeholder="Ragione sociale"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Partita IVA</label>
                <Input
                  value={formData.vat_number || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, vat_number: e.target.value || null })
                  }
                  placeholder="Partita IVA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Codice Fiscale</label>
                <Input
                  value={formData.tax_code || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_code: e.target.value || null })
                  }
                  placeholder="Codice fiscale"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Codice SDI</label>
                <Input
                  value={formData.sdi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sdi: e.target.value || null })
                  }
                  placeholder="Codice SDI"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PEC</label>
                <Input
                  type="email"
                  value={formData.pec || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pec: e.target.value || null })
                  }
                  placeholder="Indirizzo PEC"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Indirizzo di Fatturazione</label>
                <Input
                  value={formData.billing_address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, billing_address: e.target.value || null })
                  }
                  placeholder="Indirizzo di fatturazione"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Input
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value || null })
                }
                placeholder="Note aggiuntive"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={handleClose}>
                Annulla
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  "Salvataggio..."
                ) : editingClient ? (
                  "Aggiorna Cliente"
                ) : (
                  "Crea Cliente"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default Clients;
