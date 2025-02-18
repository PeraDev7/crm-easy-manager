
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const { initialized } = useRequireAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["crm-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("crm_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings?.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.dark_mode]);

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

  if (!initialized) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <div className="relative">
          <AppSidebar />
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="absolute bottom-4 left-2 gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        <main className="flex-1 overflow-x-hidden">
          <div className="container py-4">
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
