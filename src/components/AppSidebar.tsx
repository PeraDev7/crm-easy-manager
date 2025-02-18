
import {
  LayoutDashboard,
  Users,
  Calendar,
  KanbanSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
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
              <Link to="/projects">
                <KanbanSquare className="w-4 h-4" />
                <span>Progetti</span>
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
              <Link to="/calendar">
                <Calendar className="w-4 h-4" />
                <span>Calendario</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
