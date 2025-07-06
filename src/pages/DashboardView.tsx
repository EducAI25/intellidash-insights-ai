import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DynamicFilters } from '@/components/dashboard/DynamicFilters';
import { DataStatsTable } from '@/components/dashboard/DataStatsTable';
import { ChartSection } from '@/components/dashboard/ChartSection';
import { KPICards } from '@/components/dashboard/KPICards';
import { ModernCharts } from '@/components/dashboard/ModernCharts';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { SheetSelector } from '@/components/dashboard/SheetSelector';
import { ExportControls } from '@/components/dashboard/ExportControls';
import { AIChat } from '@/components/dashboard/AIChat';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DashboardView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [filterColumns, setFilterColumns] = useState<string[]>([]);
  const [selectedLabelCol, setSelectedLabelCol] = useState<string | null>(null);
  const [selectedNumericCols, setSelectedNumericCols] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [availableSheets, setAvailableSheets] = useState<any[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

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
    const { error } = await supabase
      .from('dashboard_data')
      .update({ column_mappings: { columnMappings: newMappings, filterColumns: newFilters } })
      .eq('dashboard_id', id)
      .select();
    if (!error) {
      setColumnMappings(newMappings);
      setFilterColumns(newFilters);
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="p-6 space-y-6" id="dashboard-content">
        <div className="flex items-center justify-between">
          <DashboardHeader dashboard={dashboard} />
          <div className="flex gap-2">
            <ThemeToggle />
            <ExportControls dashboardTitle={dashboard?.title || ''} />
          </div>
        </div>
        
        <SheetSelector 
          sheets={availableSheets}
          selectedSheet={selectedSheet}
          onSheetSelect={setSelectedSheet}
        />
        
        <KPICards data={filteredData} />
        
        <ModernCharts data={filteredData} />
        
        <InsightsPanel data={filteredData} />
        
        <DynamicFilters
          filterColumns={filterColumns}
          columnMappings={columnMappings}
          filters={filters}
          setFilters={setFilters}
          totalData={data.length}
          filteredData={filteredData.length}
        />

        <DataStatsTable
          data={data}
          filteredData={filteredData}
          columnMappings={columnMappings}
          origCols={origCols}
          getStats={getStats}
          exportToCSV={exportToCSV}
          copyTable={copyTable}
          dashboardId={id || ''}
        />

        <ChartSection
          data={data}
          filteredData={filteredData}
          selectedLabelCol={selectedLabelCol}
          selectedNumericCols={selectedNumericCols}
          setSelectedLabelCol={setSelectedLabelCol}
          setSelectedNumericCols={setSelectedNumericCols}
        />
      </div>
      
      <AIChat data={filteredData} dashboardTitle={dashboard?.title || 'Dashboard'} />
    </div>
  );
}