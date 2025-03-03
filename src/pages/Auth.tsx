
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success' | null; message: string }>({ type: null, message: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: null, message: "" });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            setStatusMessage({ 
              type: 'error', 
              message: "Questo indirizzo email è già registrato. Prova ad effettuare il login."
            });
          } else if (error.message.includes("Password should be")) {
            setStatusMessage({ 
              type: 'error', 
              message: "La password deve essere di almeno 6 caratteri."
            });
          } else {
            setStatusMessage({ type: 'error', message: error.message });
          }
        } else {
          setStatusMessage({ 
            type: 'success', 
            message: "Registrazione completata! Controlla la tua email per verificare l'account."
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setStatusMessage({ 
              type: 'error', 
              message: "Email o password non corrette. Riprova o registrati se non hai un account."
            });
          } else if (error.message.includes("Email not confirmed")) {
            setStatusMessage({ 
              type: 'error', 
              message: "Email non verificata. Per favore verifica la tua email prima di accedere."
            });
          } else {
            setStatusMessage({ type: 'error', message: error.message });
          }
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Registrazione" : "Accedi"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Crea un nuovo account"
              : "Inserisci le tue credenziali per accedere"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {statusMessage.type && (
              <Alert variant={statusMessage.type === 'error' ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {statusMessage.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Caricamento..."
                : isSignUp
                ? "Registrati"
                : "Accedi"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setStatusMessage({ type: null, message: "" });
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isSignUp
                ? "Hai già un account? Accedi"
                : "Non hai un account? Registrati"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
