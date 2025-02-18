
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
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
    // Applica il tema in base alle impostazioni
    if (settings?.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.dark_mode]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="container py-6 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
