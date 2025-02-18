
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
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
