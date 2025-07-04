import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function DashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const { data: dash, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setDashboard(null);
        setLoading(false);
        return;
      }
      setDashboard(dash);
      // Buscar dados associados
      const { data: ddata } = await supabase
        .from('dashboard_data')
        .select('processed_data')
        .eq('dashboard_id', id)
        .maybeSingle();
      setData(Array.isArray(ddata?.processed_data) ? ddata.processed_data : []);
      setLoading(false);
    };
    fetchDashboard();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <span className="text-muted-foreground">Carregando dashboard...</span>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <span className="text-destructive font-bold mb-2">Dashboard não encontrado.</span>
        <Button onClick={() => navigate('/dashboard/boards')}>Voltar para Meus Dashboards</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {dashboard.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">{dashboard.description}</p>
          <div className="text-xs text-muted-foreground mb-2">ID: {dashboard.id}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Preview dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <div className="overflow-x-auto rounded border bg-white">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((col) => (
                      <th key={col} className="px-2 py-1 border-b font-semibold text-left bg-muted">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Object.keys(data[0]).map((col) => (
                        <td key={col} className="px-2 py-1">{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <div className="text-xs text-muted-foreground p-2">...e mais {data.length - 10} linhas</div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Nenhum dado encontrado para este dashboard.</span>
          )}
        </CardContent>
      </Card>

      {/* Espaço para gráficos e insights automáticos futuramente */}
      <Card>
        <CardHeader>
          <CardTitle>Gráficos & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            (() => {
              // Detectar colunas numéricas
              const numericCols = Object.keys(data[0] || {}).filter(col =>
                data.slice(0, 10).every(row => !isNaN(Number(row[col])) && row[col] !== '' && row[col] !== null)
              );
              const labelCol = Object.keys(data[0] || {})[0];
              if (numericCols.length === 0) {
                return <div className="text-muted-foreground">Nenhuma coluna numérica detectada para gráfico.</div>;
              }
              return (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={labelCol} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {numericCols.map(col => (
                      <Bar key={col} dataKey={col} fill="#8884d8" />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              );
            })()
          ) : (
            <div className="text-muted-foreground">Nenhum dado disponível para gráficos.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 