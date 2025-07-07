import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Search,
  Calendar,
  MoreVertical,
  Plus,
  Eye,
  Edit,
  Trash2,
  Share2,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDashboardLimits } from '@/hooks/useDashboardLimits';
import { UserLayout } from '@/components/layout/UserLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export default function MyDashboards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, isLoading: limitsLoading, checkCanCreate } = useDashboardLimits();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchDashboards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDashboards(data || []);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dashboards",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDashboard = () => {
    const { canCreate, message } = checkCanCreate();
    if (!canCreate && message) {
      toast({
        title: "Limite atingido",
        description: message,
        variant: "destructive"
      });
      return;
    }
    navigate('/dashboard/upload');
  };

  const handleDeleteDashboard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Dashboard excluído",
        description: "O dashboard foi removido com sucesso",
      });
      
      fetchDashboards();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o dashboard",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const filteredDashboards = dashboards.filter(dashboard => {
    const matchesSearch = dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dashboard.description && dashboard.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || dashboard.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    fetchDashboards();
  }, [user]);

  return (
    <UserLayout>
      <div className="space-y-8">
        {/* Header with Stats */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Meus Dashboards</h1>
              <p className="text-muted-foreground">
                Gerencie todos os seus dashboards em um só lugar
              </p>
            </div>
            <Button 
              onClick={handleCreateDashboard}
              disabled={!stats.canCreateMore}
              className="gap-2"
              variant="mirtilo"
            >
              <Plus className="h-4 w-4" />
              Novo Dashboard
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dashboards Ativos</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {limitsLoading ? '...' : stats.activeDashboards}
                </div>
                <p className="text-xs text-muted-foreground">
                  dashboards criados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Limite do Plano</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {limitsLoading ? '...' : stats.dashboardLimit}
                </div>
                <p className="text-xs text-muted-foreground">
                  total disponível
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {limitsLoading ? '...' : stats.availableDashboards}
                </div>
                <p className="text-xs text-muted-foreground">
                  restantes para usar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar dashboards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {filterStatus === 'all' ? 'Todos' : filterStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                Ativos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                Rascunhos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dashboards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDashboards.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum dashboard encontrado' : 'Nenhum dashboard criado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro dashboard'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleCreateDashboard}
                  disabled={!stats.canCreateMore}
                  variant="mirtilo"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map((dashboard) => (
              <Card key={dashboard.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {dashboard.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={dashboard.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {dashboard.status === 'active' ? 'Ativo' : 'Rascunho'}
                        </Badge>
                        {dashboard.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Público
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/view/${dashboard.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/edit/${dashboard.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteDashboard(dashboard.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {dashboard.description || 'Sem descrição'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Criado em {formatDate(dashboard.created_at)}</span>
                    <span>Editado em {formatDate(dashboard.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Limit Warning */}
        {!stats.canCreateMore && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-amber-800">
                    Limite de dashboards atingido
                  </p>
                  <p className="text-sm text-amber-700">
                    Você está usando {stats.activeDashboards} de {stats.dashboardLimit} dashboards disponíveis. 
                    Faça upgrade do seu plano para criar mais.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Fazer Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}