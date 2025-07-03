import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UserLoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserLoginForm({ onLogin, isLoading = false }: UserLoginFormProps) {
  const [email, setEmail] = useState("usuario@mirtilo.com");
  const [password, setPassword] = useState("123456***");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <Card className="w-full max-w-md shadow-premium border-0">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-lg"></div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao IntelliDash</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Transforme suas planilhas em dashboards inteligentes
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}