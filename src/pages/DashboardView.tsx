import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, BarChart3, Brain, Copy, Filter, TrendingUp, Pencil, Check, X, Settings, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { toast } from '@/hooks/use-toast';

export default function DashboardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [filterColumns, setFilterColumns] = useState<string[]>([]);
  const [selectedLabelCol, setSelectedLabelCol] = useState<string | null>(null);
  const [selectedNumericCols, setSelectedNumericCols] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [editingCol, setEditingCol] = useState<string | null>(null);
  const [tempColName, setTempColName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Aplicar filtros aos dados
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    Object.entries(filters).forEach(([col, value]) => {
      if (value) {
        filtered = filtered.filter(row => 
          String(row[col]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    setFilteredData(filtered);
  }, [data, filters]);

  // Calcular estatísticas dos dados numéricos
  const getStats = () => {
    if (!filteredData || filteredData.length === 0) return {};
    
    const numericCols = Object.keys(filteredData[0]).filter(col =>
      filteredData.every(row => !isNaN(Number(row[col])) && row[col] !== '' && row[col] !== null)
    );
    
    const stats: Record<string, any> = {};
    numericCols.forEach(col => {
      const values = filteredData.map(row => Number(row[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        stats[col] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          count: values.length
        };
      }
    });
    return stats;
  };

  // Função para salvar mapeamento/filtros
  async function saveColumnSettings(newMappings: Record<string, string>, newFilters: string[]) {
    setSaving(true);
    const { error } = await supabase
      .from('dashboard_data')
      .update({ column_mappings: { columnMappings: newMappings, filterColumns: newFilters } })
      .eq('dashboard_id', id)
      .select();
    setSaving(false);
    if (!error) {
      setColumnMappings(newMappings);
      setFilterColumns(newFilters);
      setSuccessMsg('Alterações salvas com sucesso!');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  }

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
      // Buscar dados associados e mapeamento de colunas
      const { data: ddata } = await supabase
        .from('dashboard_data')
        .select('processed_data,column_mappings')
        .eq('dashboard_id', id)
        .maybeSingle();
      setData(Array.isArray(ddata?.processed_data) ? ddata.processed_data : []);
      let mappings = {};
      let filters = [];
      if (ddata?.column_mappings) {
        let cm = ddata.column_mappings;
        if (typeof cm === 'string') {
          try { cm = JSON.parse(cm); } catch { cm = {}; }
        }
        if (typeof cm === 'object' && cm !== null && !Array.isArray(cm)) {
          mappings = cm.columnMappings || {};
          filters = Array.isArray(cm.filterColumns) ? cm.filterColumns : [];
        }
      }
      setColumnMappings(mappings);
      setFilterColumns(filters);
      setLoading(false);
    };
    fetchDashboard();
  }, [id]);

  // Atualizar seleção padrão quando os dados mudam
  useEffect(() => {
    if (data && data.length > 0) {
      const cols = Object.keys(data[0]);
      const numericCols = cols.filter(col =>
        data.slice(0, 10).every(row => !isNaN(Number(row[col])) && row[col] !== '' && row[col] !== null)
      );
      setSelectedLabelCol(cols[0]);
      setSelectedNumericCols(numericCols);
    }
  }, [data]);

  // Função para exportar CSV
  function exportToCSV() {
    if (!filteredData || filteredData.length === 0) return;
    const cols = Object.keys(filteredData[0]);
    const csvRows = [cols.join(',')];
    for (const row of filteredData) {
      csvRows.push(cols.map(col => `"${String(row[col]).replace(/"/g, '""')}"`).join(','));
    }
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboard?.title || 'dashboard'}-dados-filtrados.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Função para copiar tabela
  function copyTable() {
    if (!filteredData || filteredData.length === 0) return;
    const cols = Object.keys(filteredData[0]);
    const rows = [cols.join('\t')];
    for (const row of filteredData.slice(0, 10)) {
      rows.push(cols.map(col => String(row[col])).join('\t'));
    }
    navigator.clipboard.writeText(rows.join('\n'));
  }

  // Usar nomes mapeados para exibir colunas
  const displayCols = Object.keys(data[0] || {}).map(orig => columnMappings[orig] || orig);
  const origCols = Object.keys(data[0] || {});

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
    <div className="p-6 space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/boards')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {dashboard.title}
            </h1>
            <p className="text-muted-foreground">{dashboard.description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/dashboard/edit/${id}`)}>
          <Settings className="h-4 w-4 mr-2" />
          Editar Dashboard
        </Button>
      </div>

      {/* Filtros Dinâmicos */}
      {filterColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterColumns.map(col => (
                <div key={col} className="space-y-2">
                  <label className="text-sm font-medium">{columnMappings[col] || col}</label>
                  <Input
                    type="text"
                    placeholder={`Filtrar por ${columnMappings[col] || col}...`}
                    value={filters[col] || ''}
                    onChange={e => setFilters(prev => ({ ...prev, [col]: e.target.value }))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            {Object.values(filters).some(f => f) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {filteredData.length} de {data.length} registros
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilters({})}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dados & Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <>
              {/* Estatísticas rápidas */}
              {(() => {
                const stats = getStats();
                const statCols = Object.keys(stats);
                if (statCols.length > 0) {
                  return (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Estatísticas Rápidas</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {statCols.map(col => (
                          <div key={col} className="text-xs">
                            <div className="font-semibold text-primary">{columnMappings[col] || col}</div>
                            <div>Min: {stats[col].min.toFixed(2)}</div>
                            <div>Max: {stats[col].max.toFixed(2)}</div>
                            <div>Média: {stats[col].avg.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="outline" onClick={exportToCSV}>
                  Exportar CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  copyTable();
                  toast({
                    title: "Dados copiados!",
                    description: "Os primeiros 10 registros foram copiados para a área de transferência.",
                  });
                }}>
                  <Copy className="w-4 h-4 mr-1 inline" /> Copiar Dados
                </Button>
                <span className="text-xs text-muted-foreground self-center">
                  {filteredData.length} de {data.length} registros
                </span>
              </div>

              <div className="overflow-x-auto rounded border bg-white">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr>
                      {origCols.map((col) => (
                        <th key={col} className="px-2 py-1 border-b font-semibold text-left bg-muted">
                          {columnMappings[col] || col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {origCols.map((col) => (
                          <td key={col} className="px-2 py-1">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredData.length > 10 && (
                  <div className="text-xs text-muted-foreground p-2">
                    ...e mais {filteredData.length - 10} linhas
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum dado encontrado para este dashboard.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate(`/dashboard/edit/${id}`)}
              >
                Configurar Dados
              </Button>
            </div>
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
            <>
              {/* Seletor de colunas */}
              <div className="flex flex-wrap gap-4 mb-4 items-end">
                <div>
                  <label className="block text-xs font-semibold mb-1">Coluna do eixo X:</label>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={selectedLabelCol || ''}
                    onChange={e => setSelectedLabelCol(e.target.value)}
                  >
                    {Object.keys(data[0]).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Colunas numéricas (Y):</label>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    multiple
                    value={selectedNumericCols}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setSelectedNumericCols(options);
                    }}
                    style={{ minWidth: 120, height: 80 }}
                  >
                    {Object.keys(data[0]).filter(col =>
                      data.slice(0, 10).every(row => !isNaN(Number(row[col])) && row[col] !== '' && row[col] !== null)
                    ).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Gráfico */}
              {selectedLabelCol && selectedNumericCols.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedLabelCol} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedNumericCols.map(col => (
                      <Bar key={col} dataKey={col} fill="#8884d8" />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground">Selecione ao menos uma coluna numérica para visualizar o gráfico.</div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">Nenhum dado disponível para gráficos.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 