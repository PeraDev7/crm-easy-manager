
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderPlus } from "lucide-react";

const Projects = () => {
  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Progetti</h1>
        <Button className="flex items-center gap-2">
          <FolderPlus className="h-4 w-4" />
          Nuovo Progetto
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>Progetto Demo</CardTitle>
            <CardDescription>Cliente: Demo Client</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stato: In Progress
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Projects;
