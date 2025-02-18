
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText } from "lucide-react";
import { format } from "date-fns";

type Invoice = {
  id: string;
  number: string;
  date: string;
  due_date: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  project_id: string | null;
  projects?: {
    name: string;
    clients?: {
      name: string;
    };
  };
};

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          projects (
            name,
            clients (
              name
            )
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices?.filter((invoice) =>
    invoice.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Fatture</h1>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search">Cerca fattura</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Cerca per numero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div>Caricamento...</div>
        ) : (
          <div className="grid gap-4">
            {filteredInvoices?.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">
                          Fattura #{invoice.number}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            invoice.payment_status
                          )}`}
                        >
                          {invoice.payment_status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Progetto: {invoice.projects?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {invoice.projects?.clients?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data: {format(new Date(invoice.date), "dd/MM/yyyy")}
                      </p>
                      {invoice.due_date && (
                        <p className="text-sm text-muted-foreground">
                          Scadenza: {format(new Date(invoice.due_date), "dd/MM/yyyy")}
                        </p>
                      )}
                      <p className="text-sm font-medium">
                        Totale: €{invoice.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizza
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
