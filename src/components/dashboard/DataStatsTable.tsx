import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Copy, Brain } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataStatsTableProps {
  data: any[];
  filteredData: any[];
  columnMappings: Record<string, string>;
  origCols: string[];
  getStats: () => Record<string, any>;
  exportToCSV: () => void;
  copyTable: () => void;
  dashboardId: string;
}

export function DataStatsTable({ 
  data, 
  filteredData, 
  columnMappings, 
  origCols, 
  getStats, 
  exportToCSV, 
  copyTable, 
  dashboardId 
}: DataStatsTableProps) {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dados & Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum dado encontrado para este dashboard.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate(`/dashboard/edit/${dashboardId}`)}
            >
              Configurar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getStats();
  const statCols = Object.keys(stats);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Dados & Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Estatísticas rápidas */}
        {statCols.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Estatísticas Rápidas</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statCols.map(col => {
                const stat = stats[col];
                const isLargeNumber = stat.avg > 1000;
                const isCurrency = col.toLowerCase().includes('valor') || col.toLowerCase().includes('preço') || col.toLowerCase().includes('price');
                
                const formatNumber = (num: number) => {
                  if (isCurrency) {
                    return num.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                  }
                  if (isLargeNumber) {
                    return num.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    });
                  }
                  return num.toFixed(2);
                };

                return (
                  <div key={col} className="text-xs">
                    <div className="font-semibold text-primary">{columnMappings[col] || col}</div>
                    <div>Min: {formatNumber(stat.min)}</div>
                    <div>Max: {formatNumber(stat.max)}</div>
                    <div>Média: {formatNumber(stat.avg)}</div>
                    <div className="text-muted-foreground">Total: {stat.sum ? formatNumber(stat.sum) : 'N/A'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
      </CardContent>
    </Card>
  );
}