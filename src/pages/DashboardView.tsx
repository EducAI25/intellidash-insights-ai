import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3, Brain, Copy, Filter, TrendingUp, Pencil, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

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
                            <div className="font-semibold text-primary">{col}</div>
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

              {/* Filtros apenas para colunas selecionadas */}
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Filtros</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {origCols.map(col => (
                    <div key={col} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={filterColumns.includes(col)}
                        onChange={e => {
                          const newFilters = e.target.checked
                            ? [...filterColumns, col]
                            : filterColumns.filter(f => f !== col);
                          saveColumnSettings(columnMappings, newFilters);
                        }}
                        className="mr-1"
                        title="Marque para usar esta coluna como filtro no dashboard"
                      />
                      {editingCol === col ? (
                        <>
                          <input
                            className="border rounded px-1 text-xs mr-1"
                            value={tempColName}
                            onChange={e => setTempColName(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => {
                            const newMappings = { ...columnMappings, [col]: tempColName };
                            saveColumnSettings(newMappings, filterColumns);
                            setEditingCol(null);
                          }} title="Salvar novo nome da coluna"><Check className="w-4 h-4 text-green-600" /></button>
                          <button onClick={() => setEditingCol(null)} title="Cancelar edição"><X className="w-4 h-4 text-red-600" /></button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-medium">{columnMappings[col] || col}</span>
                          <button onClick={() => { setEditingCol(col); setTempColName(columnMappings[col] || col); }} title="Editar nome da coluna">
                            <Pencil className="w-3 h-3 text-muted-foreground ml-1" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {saving && <div className="text-xs text-muted-foreground mt-2">Salvando...</div>}
                {successMsg && <div className="text-xs text-green-600 mt-2">{successMsg}</div>}
              </div>
              <div className="flex gap-2 mb-2">
                <Button size="sm" variant="outline" onClick={exportToCSV}>
                  Exportar CSV
                </Button>
                <Button size="sm" variant="outline" onClick={copyTable}>
                  <Copy className="w-4 h-4 mr-1 inline" /> Copiar tabela
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
                        <th key={col} className="px-2 py-1 border-b font-semibold text-left bg-muted">{columnMappings[col] || col}</th>
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
                  <div className="text-xs text-muted-foreground p-2">...e mais {filteredData.length - 10} linhas</div>
                )}
              </div>
            </>
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