
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { initialized } = useRequireAuth();

  const { data: settings } = useQuery({
    queryKey: ["crm-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("crm_settings")
        .select("*")
        .eq("created_by", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile?.primary_color) {
      document.documentElement.style.setProperty('--brand-color', profile.primary_color);
    }
  }, [profile?.primary_color]);

  if (!initialized) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden p-6">
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
