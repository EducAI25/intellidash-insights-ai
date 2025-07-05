import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface ChartSectionProps {
  data: any[];
  filteredData: any[];
  selectedLabelCol: string | null;
  selectedNumericCols: string[];
  setSelectedLabelCol: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedNumericCols: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ChartSection({ 
  data, 
  filteredData, 
  selectedLabelCol, 
  selectedNumericCols, 
  setSelectedLabelCol, 
  setSelectedNumericCols 
}: ChartSectionProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Nenhum dado disponível para gráficos.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráficos & Insights</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}