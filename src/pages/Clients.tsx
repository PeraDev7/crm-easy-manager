
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";

const Clients = () => {
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clienti</h1>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Nuovo Cliente
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Cliente Demo</CardTitle>
            <CardDescription>cliente@example.com</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              0 progetti attivi
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Clients;
