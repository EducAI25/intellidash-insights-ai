import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLoginForm } from "@/components/auth/UserLoginForm";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type LoginMode = "user" | "admin";

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("user");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUserLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulação de login - substituir por autenticação real
      if (email === "usuario@mirtilo.com" && password === "123456***") {
        localStorage.setItem("user_auth", JSON.stringify({ 
          type: "user", 
          email, 
          name: "Usuário Demo" 
        }));
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao IntelliDash",
        });
        navigate("/dashboard");
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulação de login admin - substituir por autenticação real
      if (email === "admin@mirtilo.com" && password === "jayafcg3") {
        localStorage.setItem("user_auth", JSON.stringify({ 
          type: "admin", 
          email, 
          name: "Administrator" 
        }));
        toast({
          title: "Acesso administrativo concedido",
          description: "Bem-vindo ao painel de administração",
        });
        navigate("/admin");
      } else {
        throw new Error("Credenciais administrativas inválidas");
      }
    } catch (error) {
      toast({
        title: "Erro no acesso administrativo",
        description: "Credenciais inválidas ou acesso negado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Mode Toggle */}
        <div className="flex bg-white rounded-xl p-1 shadow-elegant">
          <Button
            variant={mode === "user" ? "default" : "ghost"}
            className={`flex-1 ${mode === "user" ? "bg-gradient-primary" : ""}`}
            onClick={() => setMode("user")}
          >
            Usuário
          </Button>
          <Button
            variant={mode === "admin" ? "secondary" : "ghost"}
            className="flex-1"
            onClick={() => setMode("admin")}
          >
            Administrador
          </Button>
        </div>

        {/* Login Forms */}
        {mode === "user" ? (
          <UserLoginForm onLogin={handleUserLogin} isLoading={isLoading} />
        ) : (
          <AdminLoginForm onLogin={handleAdminLogin} isLoading={isLoading} />
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 IntelliDash - Dashboards Inteligentes</p>
        </div>
      </div>
    </div>
  );
}