import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminLoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function AdminLoginForm({ onLogin, isLoading = false }: AdminLoginFormProps) {
  const [email, setEmail] = useState("admin@mirtilo.com");
  const [password, setPassword] = useState("jayafcg3");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <Card className="w-full max-w-md shadow-premium border-0">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-dark rounded-2xl flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-2xl font-bold">Painel Administrativo</CardTitle>
            <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
              Admin
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Acesso restrito para administradores do sistema
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-medium">
              Email Administrativo
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="admin-password"
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

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-dark hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Acessar Painel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}