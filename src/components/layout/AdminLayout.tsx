import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Activity, 
  FileText, 
  Database, 
  Settings, 
  LogOut,
  Menu,
  Brain,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const navigation = [
  { name: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
  { name: 'Gerenciamento de Usuários', href: '/admin/users', icon: Users },
  { name: 'Planos/Assinaturas', href: '/admin/plans', icon: CreditCard },
  { name: 'Monitoramento de Uso da API', href: '/admin/api-monitoring', icon: Activity },
  { name: 'Auditoria & Logs', href: '/admin/audit', icon: FileText },
  { name: 'Backup & Restauração', href: '/admin/backup', icon: Database },
  { name: 'Configurações do Sistema', href: '/admin/settings', icon: Settings },
  { name: 'Inteligência de Negócios', href: '/admin/ai-insights', icon: Brain },
];

export function AdminLayout({ children, activeSection = "Visão Geral" }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("user_auth");
    toast({
      title: "Logout administrativo realizado",
      description: "Sessão encerrada com segurança",
    });
    navigate("/login");
  };

  const userAuth = JSON.parse(localStorage.getItem("user_auth") || "{}");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary border-b border-border shadow-elegant sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-secondary-foreground"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center ml-4 md:ml-0">
                <div className="w-10 h-10 bg-gradient-mirtilo rounded-xl mr-3 flex items-center justify-center shadow-mirtilo">
                  <div className="w-6 h-6 bg-white rounded-full relative">
                    <div className="absolute inset-1 bg-gradient-mirtilo rounded-full"></div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-secondary-foreground">
                  Mirtilo Admin
                </h1>
                <Badge className="ml-3 bg-red-100 text-red-800 border-red-200">
                  Administrativo
                </Badge>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-mirtilo text-white shadow-mirtilo">
                        <div className="w-3 h-3 bg-white rounded-full relative">
                          <div className="absolute inset-0.5 bg-gradient-mirtilo rounded-full"></div>
                        </div>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userAuth.name} (Admin)
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userAuth.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações Admin</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-72 bg-secondary text-secondary-foreground min-h-screen`}>
          <div className="p-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.name;
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-secondary-foreground hover:bg-secondary-foreground/10"
                  }`}
                  onClick={() => navigate(item.href)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}