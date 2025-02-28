
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { QuotesList } from "@/components/quotes/QuotesList";
import { CreateQuoteSheet } from "@/components/quotes/CreateQuoteSheet";
import { useState } from "react";
import { Layout } from "@/components/Layout";

export type Quote = {
  id: string;
  quote_number: string;
  date: string;
  total: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  client: {
    id: string;
    name: string;
    business_name: string | null;
  } | null;
};

export default function Quotes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          id,
          quote_number,
          date,
          total,
          status,
          client:clients(id, name, business_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Quote[];
    },
  });

  return (
    <Layout>
      <div className="container py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Preventivi</h1>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Preventivo
          </Button>
        </div>

        {isLoading ? (
          <div>Caricamento...</div>
        ) : (
          <QuotesList quotes={quotes || []} />
        )}

        <CreateQuoteSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
    </Layout>
  );
}
