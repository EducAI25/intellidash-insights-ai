import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Upload, 
  Calendar,
  ArrowRight,
  Plus,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useDashboardLimits } from '@/hooks/useDashboardLimits';
import { UserLayout } from '@/components/layout/UserLayout';

export default function Home() {
  const navigate = useNavigate();
  const { stats, isLoading } = useDashboardLimits();

  const quickActions = [
    {
      title: 'Criar Novo Dashboard',
      description: 'Upload de dados e criação automática',
      icon: Plus,
      action: () => navigate('/dashboard/upload'),
      variant: 'mirtilo' as const,
    },
    {
      title: 'Ver Meus Dashboards',
      description: 'Acessar todos os seus dashboards',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard/boards'),
      variant: 'outline' as const,
    },
    {
      title: 'Ajuda & Suporte',
      description: 'Tutoriais e documentação',
      icon: ArrowRight,
      action: () => navigate('/dashboard/help'),
      variant: 'ghost' as const,
    },
  ];

  const usagePercentage = stats.dashboardLimit > 0 ? (stats.activeDashboards / stats.dashboardLimit) * 100 : 0;

  return (
    <UserLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-mirtilo rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo ao Mirtilo</h1>
            <p className="text-white/80 text-lg">
              Transforme seus dados em insights poderosos com IA
            </p>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <BarChart3 className="h-24 w-24" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboards Ativos</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? '...' : stats.activeDashboards}
              </div>
              <p className="text-xs text-muted-foreground">
                de {stats.dashboardLimit} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : stats.availableDashboards}
              </div>
              <p className="text-xs text-muted-foreground">
                dashboards restantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 capitalize">
                {stats.planName}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.dashboardLimit} dashboards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Uso da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dashboards utilizados</span>
                <span>{stats.activeDashboards}/{stats.dashboardLimit}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            
            {usagePercentage > 80 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Atenção ao limite</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Você está próximo do limite do seu plano. Considere fazer upgrade.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <p className="text-muted-foreground">
              O que você gostaria de fazer hoje?
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  className="h-auto p-6 flex-col items-start space-y-2"
                  onClick={action.action}
                  disabled={action.variant === 'mirtilo' && !stats.canCreateMore}
                >
                  <action.icon className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm opacity-80">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
            
            {!stats.canCreateMore && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Você atingiu o limite de {stats.dashboardLimit} dashboards. 
                  Para criar mais, faça upgrade do seu plano.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Fazer Upgrade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}