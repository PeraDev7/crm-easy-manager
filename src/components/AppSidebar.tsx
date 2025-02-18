
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

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

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
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h1 className="font-bold">CRM</h1>
          <p className="text-sm text-muted-foreground">
            Gestisci la tua attività
          </p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/clients">
                <Users className="w-4 h-4" />
                <span>Clienti</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/projects">
                <KanbanSquare className="w-4 h-4" />
                <span>Progetti</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/leads">
                <UserSquare className="w-4 h-4" />
                <span>Leads</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/quotes">
                <List className="w-4 h-4" />
                <span>Preventivi</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/calendar">
                <Calendar className="w-4 h-4" />
                <span>Calendario</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname.startsWith("/settings")}>
              <Link to="/settings">
                <Settings className="w-4 h-4" />
                <span>Impostazioni</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={location.pathname === "/settings"}
                >
                  <Link to="/settings">
                    <Cog className="w-4 h-4" />
                    <span>Generale</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={location.pathname === "/settings/quotes"}
                >
                  <Link to="/settings/quotes">
                    <FileText className="w-4 h-4" />
                    <span>Preventivi</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={location.pathname === "/settings/user"}
                >
                  <Link to="/settings/user">
                    <User className="w-4 h-4" />
                    <span>Utente</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenuButton onClick={handleLogout} className="mt-auto gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
