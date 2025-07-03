import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  Clock, 
  HelpCircle, 
  Settings, 
  User, 
  LogOut,
  Menu,
  Search,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface UserLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Meus Dashboards', href: '/dashboard/boards', icon: LayoutDashboard },
  { name: 'Upload de Dados', href: '/dashboard/upload', icon: Upload },
  { name: 'Histórico', href: '/dashboard/history', icon: Clock },
  { name: 'Ajuda & Suporte', href: '/dashboard/help', icon: HelpCircle },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
];

export function UserLayout({ children, activeSection = "Home" }: UserLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("user_auth");
    toast({
      title: "Logout realizado",
      description: "Até a próxima!",
    });
    navigate("/login");
  };

  const userAuth = JSON.parse(localStorage.getItem("user_auth") || "{}");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-elegant sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center ml-4 md:ml-0">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg mr-3"></div>
                <h1 className="text-xl font-bold text-secondary">IntelliDash</h1>
              </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar dashboards..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Button
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => navigate('/dashboard/upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Nova Planilha
              </Button>
              
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userAuth.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Bem-vindo(a), {userAuth.name}!
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userAuth.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
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
        } md:block w-64 bg-sidebar text-sidebar-foreground min-h-screen`}>
          <div className="p-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.name;
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => navigate(item.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
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