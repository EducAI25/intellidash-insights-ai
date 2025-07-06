import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, ChevronRight } from 'lucide-react';

interface SheetSelectorProps {
  sheets: Array<{
    name: string;
    data: any[];
    preview: string[];
  }>;
  selectedSheet: string | null;
  onSheetSelect: (sheetName: string) => void;
}

export function SheetSelector({ sheets, selectedSheet, onSheetSelect }: SheetSelectorProps) {
  if (sheets.length <= 1) return null;

  return (
    <Card className="mb-6 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Selecione a Aba da Planilha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheet) => (
            <Card 
              key={sheet.name}
              className={`cursor-pointer transition-all duration-200 hover:shadow-mirtilo ${
                selectedSheet === sheet.name 
                  ? 'ring-2 ring-primary bg-primary-soft' 
                  : 'hover:border-primary'
              }`}
              onClick={() => onSheetSelect(sheet.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{sheet.name}</h3>
                  <Badge variant="secondary">
                    {sheet.data.length} registros
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">
                  <div className="space-y-1">
                    {sheet.preview.slice(0, 3).map((col, idx) => (
                      <div key={idx} className="truncate">• {col}</div>
                    ))}
                    {sheet.preview.length > 3 && (
                      <div className="text-xs">+ {sheet.preview.length - 3} mais...</div>
                    )}
                  </div>
                </div>

                <Button 
                  variant={selectedSheet === sheet.name ? "default" : "outline"} 
                  size="sm" 
                  className="w-full"
                >
                  {selectedSheet === sheet.name ? 'Selecionada' : 'Selecionar'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}