import { useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  MoreVertical,
  Search,
  Filter,
  Eye,
  Edit,
  Share,
  Copy,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data para dashboards
const mockDashboards = [
  {
    id: 1,
    name: "Vendas Q4 2024",
    description: "Análise de vendas do último trimestre",
    thumbnail: "📊",
    lastUpdated: "2 horas atrás",
    status: "Ativo",
    kpis: { revenue: "R$ 1.2M", growth: "+12%", customers: "2.4K" }
  },
  {
    id: 2,
    name: "Performance Marketing",
    description: "Métricas de campanhas digitais",
    thumbnail: "📈",
    lastUpdated: "1 dia atrás",
    status: "Ativo",
    kpis: { cac: "R$ 45", roas: "4.2x", conversions: "892" }
  },
  {
    id: 3,
    name: "Recursos Humanos",
    description: "Dashboard de RH e colaboradores",
    thumbnail: "👥",
    lastUpdated: "3 dias atrás",
    status: "Ativo",
    kpis: { employees: "145", satisfaction: "4.2/5", turnover: "8%" }
  }
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboards] = useState(mockDashboards);

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UserLayout activeSection="Home">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-primary rounded-3xl p-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">
              Transforme dados em insights inteligentes
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Bem-vindo ao IntelliDash! Faça upload de suas planilhas e deixe nossa IA criar 
              dashboards interativos e análises poderosas automaticamente.
            </p>
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
              >
                <Upload className="mr-2 h-5 w-5" />
                Fazer Upload
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                Ver Tutorial
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dashboards Ativos</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Insights Gerados</p>
                  <p className="text-2xl font-bold">47</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                  <p className="text-2xl font-bold">2h</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboards Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Meus Dashboards</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar dashboards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Dashboard Grid */}
          {filteredDashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDashboards.map((dashboard) => (
                <Card key={dashboard.id} className="shadow-elegant hover:shadow-premium transition-shadow cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{dashboard.thumbnail}</div>
                        <div>
                          <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {dashboard.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="mr-2 h-4 w-4" />
                            Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="mb-4">
                      {dashboard.description}
                    </CardDescription>
                    
                    {/* KPIs Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {Object.entries(dashboard.kpis).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground capitalize">{key}</p>
                          <p className="font-semibold text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Atualizado {dashboard.lastUpdated}</span>
                      <Button size="sm" className="bg-gradient-primary">
                        <Eye className="mr-1 h-3 w-3" />
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-elegant">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Comece criando seu primeiro dashboard</h3>
                <p className="text-muted-foreground mb-6">
                  Faça upload de uma planilha e nossa IA criará automaticamente 
                  visualizações inteligentes dos seus dados.
                </p>
                <Button className="bg-gradient-primary">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Nova Planilha
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}