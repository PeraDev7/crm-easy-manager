
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/components/ui/use-toast";

// Tipo per il form del cliente
type ClientFormData = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
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
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: null,
    phone: null,
    address: null,
    notes: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query per ottenere i clienti
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");
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

      {isLoading ? (
        <div>Caricamento...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-lg transition-shadow"
            >
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
                <CardDescription>{client.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {client.phone && <p>📞 {client.phone}</p>}
                  {client.address && <p>📍 {client.address}</p>}
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
                placeholder="Indirizzo completo"
              />
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
