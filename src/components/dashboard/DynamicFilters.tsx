import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface DynamicFiltersProps {
  filterColumns: string[];
  columnMappings: Record<string, string>;
  filters: Record<string, string>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  totalData: number;
  filteredData: number;
}

export function DynamicFilters({ 
  filterColumns, 
  columnMappings, 
  filters, 
  setFilters, 
  totalData, 
  filteredData 
}: DynamicFiltersProps) {
  if (filterColumns.length === 0) return null;

  return (
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
              Mostrando {filteredData} de {totalData} registros
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
  );
}