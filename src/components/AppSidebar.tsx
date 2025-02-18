
import {
  LayoutDashboard,
  Users,
  Calendar,
  KanbanSquare,
  Settings,
  FileText,
  User,
  Cog,
  List,
  UserSquare,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="w-64 h-screen border-r bg-sidebar p-4 flex flex-col">
      <div className="p-4">
        <h1 className="font-bold">VitoCRM</h1>
        <p className="text-sm text-muted-foreground">
          Gestisci la tua attività
        </p>
      </div>
      
      <div className="flex-1 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            location.pathname === "/" && "bg-accent"
          )}
          asChild
        >
          <Link to="/">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            location.pathname === "/clients" && "bg-accent"
          )}
          asChild
        >
          <Link to="/clients">
            <Users className="w-4 h-4" />
            <span>Clienti</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            location.pathname === "/projects" && "bg-accent"
          )}
          asChild
        >
          <Link to="/projects">
            <KanbanSquare className="w-4 h-4" />
            <span>Progetti</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            location.pathname === "/leads" && "bg-accent"
          )}
          asChild
        >
          <Link to="/leads">
            <UserSquare className="w-4 h-4" />
            <span>Leads</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            location.pathname === "/quotes" && "bg-accent"
          )}
          asChild
        >
          <Link to="/quotes">
            <List className="w-4 h-4" />
            <span>Preventivi</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            location.pathname === "/calendar" && "bg-accent"
          )}
          asChild
        >
          <Link to="/calendar">
            <Calendar className="w-4 h-4" />
            <span>Calendario</span>
          </Link>
        </Button>

        <div className="pt-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              location.pathname === "/settings" && "bg-accent"
            )}
            asChild
          >
            <Link to="/settings">
              <Settings className="w-4 h-4" />
              <span>Impostazioni</span>
            </Link>
          </Button>

          <div className="pl-4 space-y-1 mt-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-sm",
                location.pathname === "/settings" && "bg-accent"
              )}
              asChild
            >
              <Link to="/settings">
                <Cog className="w-4 h-4" />
                <span>Generale</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-sm",
                location.pathname === "/settings/quotes" && "bg-accent"
              )}
              asChild
            >
              <Link to="/settings/quotes">
                <FileText className="w-4 h-4" />
                <span>Preventivi</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-sm",
                location.pathname === "/settings/user" && "bg-accent"
              )}
              asChild
            >
              <Link to="/settings/user">
                <User className="w-4 h-4" />
                <span>Utente</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="px-4 py-2 border-t text-sm text-muted-foreground">
          <p>Powered by</p>
          <a 
            href="https://www.risolvity.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Risolvity
          </a>
        </div>
        
        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  );
}
