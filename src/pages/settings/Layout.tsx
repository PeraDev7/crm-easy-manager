
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout as AppLayout } from "@/components/Layout";
import { cn } from "@/lib/utils";

export default function SettingsLayout() {
  const location = useLocation();

  return (
    <AppLayout>
      <div className="space-y-6 p-10 pb-16">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Impostazioni</h2>
          <p className="text-muted-foreground">
            Gestisci le impostazioni del tuo account e dell'applicazione
          </p>
        </div>

        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              <Link
                to="/settings"
                className={cn(
                  "justify-start hover:bg-accent hover:text-accent-foreground",
                  "rounded-lg px-3 py-2 text-base font-medium",
                  location.pathname === "/settings" && "bg-accent"
                )}
              >
                Generale
              </Link>
              <Link
                to="/settings/quotes"
                className={cn(
                  "justify-start hover:bg-accent hover:text-accent-foreground",
                  "rounded-lg px-3 py-2 text-base font-medium",
                  location.pathname === "/settings/quotes" && "bg-accent"
                )}
              >
                Preventivi
              </Link>
              <Link
                to="/settings/user"
                className={cn(
                  "justify-start hover:bg-accent hover:text-accent-foreground",
                  "rounded-lg px-3 py-2 text-base font-medium",
                  location.pathname === "/settings/user" && "bg-accent"
                )}
              >
                Utente
              </Link>
            </nav>
          </aside>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
