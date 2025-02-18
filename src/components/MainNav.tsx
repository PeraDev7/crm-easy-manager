
import {
  LayoutDashboard,
  Users,
  Calendar,
  KanbanSquare,
  Settings,
  FileText,
  User,
  List,
  UserSquare,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function MainNav() {
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

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/clients", icon: Users, label: "Clienti" },
    { to: "/projects", icon: KanbanSquare, label: "Progetti" },
    { to: "/leads", icon: UserSquare, label: "Leads" },
    { to: "/quotes", icon: List, label: "Preventivi" },
    { to: "/calendar", icon: Calendar, label: "Calendario" },
    { to: "/settings", icon: Settings, label: "Impostazioni" },
    { to: "/settings/quotes", icon: FileText, label: "Preventivi" },
    { to: "/settings/user", icon: User, label: "Utente" },
  ];

  return (
    <nav className="min-w-[240px] h-screen bg-sidebar border-r border-border p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="font-bold text-xl">CRM</h1>
        <p className="text-sm text-muted-foreground">Gestisci la tua attività</p>
      </div>

      <div className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <Button
            key={item.to}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              location.pathname === item.to && "bg-accent"
            )}
            asChild
          >
            <Link to={item.to}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        className="w-full justify-start gap-2 mt-auto text-muted-foreground hover:text-foreground"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </nav>
  );
}
