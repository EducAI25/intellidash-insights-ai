import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeminiConfig } from "@/components/admin/GeminiConfig";
import { 
  Users, 
  TrendingUp, 
  Database, 
  DollarSign,
  Activity,
  Brain,
  Calendar,
  AlertTriangle
} from "lucide-react";

// Mock data para o dashboard administrativo
const systemStats = {
  totalUsers: 1247,
  activeUsers: 892,
  newRegistrations: 34,
  totalDashboards: 3456,
  geminiTokensUsed: 125678,
  mrr: 45600,
  churnRate: 2.3,
  avgDashboardsPerUser: 2.8
};

const recentActivity = [
  { 
    id: 1, 
    type: 'user_registration', 
    message: 'Novo usuário: ana.silva@empresa.com', 
    time: '5 min atrás',
    severity: 'info'
  },
  { 
    id: 2, 
    type: 'api_limit', 
    message: 'Usuário atingiu 80% do limite de tokens Gemini', 
    time: '12 min atrás',
    severity: 'warning'
  },
  { 
    id: 3, 
    type: 'dashboard_created', 
    message: '23 novos dashboards criados hoje', 
    time: '1 hora atrás',
    severity: 'success'
  },
  { 
    id: 4, 
    type: 'system_backup', 
    message: 'Backup automático concluído com sucesso', 
    time: '2 horas atrás',
    severity: 'success'
  },
];

export default function Admin() {
  return (
    <AdminLayout activeSection="Visão Geral">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary">Painel de Administração</h1>
          <p className="text-muted-foreground mt-2">
            Monitore e gerencie todo o sistema IntelliDash
          </p>
        </div>

        {/* Main KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600">
                    +{systemStats.newRegistrations} novos hoje
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">
                    R$ {(systemStats.mrr / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-green-600">+12% vs mês anterior</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dashboards Criados</p>
                  <p className="text-2xl font-bold">{systemStats.totalDashboards.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">
                    {systemStats.avgDashboardsPerUser} por usuário
                  </p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tokens Gemini</p>
                  <p className="text-2xl font-bold">
                    {(systemStats.geminiTokensUsed / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-orange-600">Este mês</p>
                </div>
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Crescimento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total de Usuários</span>
                  <span className="font-medium">{systemStats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Churn</span>
                  <span className="font-medium text-red-600">{systemStats.churnRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Crescimento Mensal</span>
                  <span className="font-medium text-green-600">+8.4%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Uso da API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tokens/Dia (Média)</span>
                  <span className="font-medium">4.2K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pico de Uso</span>
                  <span className="font-medium">8.7K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Economia Estimada</span>
                  <span className="font-medium text-green-600">R$ 2.3K</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Distribuição de Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Plano Free</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Plano Pro</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Plano Enterprise</span>
                  <span className="font-medium">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimos eventos e atividades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.severity === 'success' ? 'bg-green-500' :
                      activity.severity === 'warning' ? 'bg-orange-500' :
                      activity.severity === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  
                  {activity.severity === 'warning' && (
                    <Badge variant="outline" className="border-orange-200 text-orange-700">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Atenção
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline">
                Ver Todos os Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-20 bg-gradient-primary">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Gerenciar Usuários</span>
            </div>
          </Button>
          
          <Button variant="outline" className="h-20">
            <div className="text-center">
              <Database className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Backup Manual</span>
            </div>
          </Button>
          
          <Button variant="outline" className="h-20">
            <div className="text-center">
              <Activity className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Monitorar API</span>
            </div>
          </Button>
          
          <Button variant="outline" className="h-20">
            <div className="text-center">
              <Brain className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Chat com IA</span>
            </div>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}