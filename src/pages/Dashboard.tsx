import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { UserLayout } from "@/components/layout/UserLayout";
import { FileUpload } from "@/components/upload/FileUpload";
import { DashboardCreator } from "@/components/dashboard/DashboardCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, BarChart3, Brain, TrendingUp } from "lucide-react";
import Home from "./Home";
import MyDashboards from "./MyDashboards";
import History from "./History";
import Help from "./Help";
import Settings from "./Settings";
import DashboardView from "./DashboardView";

function DashboardHome() {
  const [dashboards, setDashboards] = useState([]);
  const [stats, setStats] = useState({
    totalDashboards: 0,
    totalRecords: 0,
    totalInsights: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboards();
      loadStats();
    }
  }, [user]);

  const loadDashboards = async () => {
    const { data } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    setDashboards(data || []);
  };

  const loadStats = async () => {
    const [dashboardsCount, recordsCount, insightsCount] = await Promise.all([
      supabase.from('dashboards').select('id', { count: 'exact' }).eq('user_id', user?.id),
      supabase.from('dashboard_data').select('processed_data', { count: 'exact' }),
      supabase.from('ai_analyses').select('id', { count: 'exact' })
    ]);

    setStats({
      totalDashboards: dashboardsCount.count || 0,
      totalRecords: recordsCount.count || 0,
      totalInsights: insightsCount.count || 0
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Dashboard Principal</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle inteligente
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-secondary">
                Dashboards Criados
              </h3>
            </div>
            <p className="text-3xl font-bold text-primary mt-2">{stats.totalDashboards}</p>
            <p className="text-sm text-muted-foreground">total criados</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-secondary">
                Dados Processados
              </h3>
            </div>
            <p className="text-3xl font-bold text-primary mt-2">{stats.totalRecords}</p>
            <p className="text-sm text-muted-foreground">registros</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-secondary">
                Insights Gerados
              </h3>
            </div>
            <p className="text-3xl font-bold text-primary mt-2">{stats.totalInsights}</p>
            <p className="text-sm text-muted-foreground">pela IA</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="p-6 h-auto bg-gradient-primary text-white hover:opacity-90"
              onClick={() => window.location.href = '/dashboard/upload'}
            >
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-6 w-6" />
                <span>Upload de Dados</span>
              </div>
            </Button>
            <Button variant="secondary" className="p-6 h-auto">
              <div className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Novo Dashboard</span>
              </div>
            </Button>
            <Button variant="outline" className="p-6 h-auto">
              <div className="flex flex-col items-center space-y-2">
                <Brain className="h-6 w-6" />
                <span>Chat com IA</span>
              </div>
            </Button>
            <Button variant="outline" className="p-6 h-auto">
              <div className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>Relatórios</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboards Recentes */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Dashboards Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum dashboard criado ainda. Faça upload dos seus dados para começar!
                </p>
                <Button 
                  className="mt-4 bg-gradient-primary hover:opacity-90"
                  onClick={() => window.location.href = '/dashboard/upload'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>
            ) : (
              dashboards.map((dashboard: any) => (
                <div
                  key={dashboard.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div>
                    <h3 className="font-medium text-foreground">
                      {dashboard.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboard.description || 'Sem descrição'}
                    </p>
                  </div>
                  <Button variant="ghost">
                    Visualizar →
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ColumnMapper({ data, onMap }: { data: any[], onMap: (mappedData: any[], columnMappings: Record<string, string>, filterColumns: string[]) => void }) {
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>(() => {
    const cols = Object.keys(data[0] || {});
    const map: Record<string, string> = {};
    cols.forEach(col => { map[col] = col; });
    return map;
  });
  const [filterColumns, setFilterColumns] = useState<string[]>([]);
  const cols = Object.keys(data[0] || {});

  const handleMap = () => {
    const mappedData = data.map(row => {
      const newRow: any = {};
      cols.forEach(col => {
        newRow[columnMappings[col]] = row[col];
      });
      return newRow;
    });
    onMap(mappedData, columnMappings, filterColumns);
  };

  return (
    <div className="mb-6 p-4 border rounded bg-muted/30">
      <h3 className="font-semibold mb-2">Mapeamento de Colunas e Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {cols.map(col => (
          <div key={col} className="flex flex-col gap-1">
            <label className="text-xs font-medium">{col}</label>
            <input
              className="border rounded px-2 py-1 text-xs"
              value={columnMappings[col]}
              onChange={e => setColumnMappings(m => ({ ...m, [col]: e.target.value }))}
              placeholder="Novo nome da coluna"
            />
            <label className="flex items-center gap-2 text-xs mt-1">
              <input
                type="checkbox"
                checked={filterColumns.includes(col)}
                onChange={e => {
                  setFilterColumns(f => e.target.checked ? [...f, col] : f.filter(c => c !== col));
                }}
              />
              Usar como filtro
            </label>
          </div>
        ))}
      </div>
      <button className="px-4 py-2 bg-primary text-white rounded" onClick={handleMap}>
        Confirmar Mapeamento
      </button>
    </div>
  );
}

function UploadPage() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [filename, setFilename] = useState("");
  const [uploadId, setUploadId] = useState<string>("");
  const [showMapper, setShowMapper] = useState(false);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [filterColumns, setFilterColumns] = useState<string[]>([]);
  const [showCreator, setShowCreator] = useState(false);

  const handleDataProcessed = (data: any[], filename: string, uploadId: string) => {
    console.log('Dados processados:', { uploadId, filename, records: data.length });
    setUploadedData(data);
    setFilename(filename);
    setUploadId(uploadId);
    setShowMapper(true);
    setShowCreator(false);
  };

  const handleMap = (mapped: any[], mappings: Record<string, string>, filters: string[]) => {
    console.log('Mapeamento confirmado:', { uploadId, mappings, filters });
    setMappedData(mapped);
    setColumnMappings(mappings);
    setFilterColumns(filters);
    setShowMapper(false);
    setShowCreator(true);
  };

  const handleDashboardCreated = (dashboardId: string) => {
    console.log('Dashboard criado:', dashboardId);
    window.location.href = `/dashboard/view/${dashboardId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Upload de Dados</h1>
        <p className="text-muted-foreground">
          Faça upload de suas planilhas e transforme dados em insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUpload onDataProcessed={handleDataProcessed} />
        {showMapper && (
          <ColumnMapper
            data={uploadedData}
            onMap={handleMap}
          />
        )}
        {showCreator && (
          <DashboardCreator 
            data={mappedData}
            filename={filename}
            uploadId={uploadId}
            columnMappings={columnMappings}
            filterColumns={filterColumns}
            onDashboardCreated={handleDashboardCreated}
          />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <UserLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/boards" element={<MyDashboards />} />
        <Route path="/history" element={<History />} />
        <Route path="/help" element={<Help />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/home" element={<Home />} />
        <Route path="/view/:id" element={<DashboardView />} />
        <Route path="/edit/:id" element={<UploadPage />} />
      </Routes>
    </UserLayout>
  );
}