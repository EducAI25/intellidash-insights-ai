import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FileUploadProps {
  onDataProcessed: (data: any[], filename: string) => void;
}

export function FileUpload({ onDataProcessed }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const processFile = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    setUploadComplete(false);

    try {
      // Simular progresso inicial
      setProgress(20);

      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Processar CSV
        const text = await file.text();
        setProgress(40);
        
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        });
        
        data = result.data;
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Processar Excel
        const arrayBuffer = await file.arrayBuffer();
        setProgress(40);
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        data = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        });
        
        // Converter para formato objeto usando primeira linha como headers
        if (data.length > 1) {
          const headers = data[0] as string[];
          data = data.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index] || '';
            });
            return obj;
          });
        }
      }

      setProgress(60);

      // Upload para Supabase Storage
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('dashboard-files')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      setProgress(80);

      // Salvar metadados no banco
      const { error: dbError } = await supabase
        .from('dashboard_data')
        .insert({
          dashboard_id: null, // Será associado quando criar o dashboard
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          raw_data: data,
          processed_data: data
        });

      if (dbError) {
        throw dbError;
      }

      setProgress(100);
      setUploadComplete(true);

      toast({
        title: "Arquivo processado com sucesso!",
        description: `${data.length} registros carregados de ${file.name}`,
      });

      onDataProcessed(data, file.name);

    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: error.message || "Verifique se o arquivo está no formato correto",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setTimeout(() => {
        setProgress(0);
        setUploadComplete(false);
      }, 2000);
    }
  }, [user, toast, onDataProcessed]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary-soft' 
              : 'border-border hover:border-primary'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            ) : uploadComplete ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <div className="relative">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <FileSpreadsheet className="h-6 w-6 text-primary absolute -bottom-1 -right-1" />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {uploading 
                  ? 'Processando arquivo...' 
                  : uploadComplete 
                    ? 'Arquivo processado!' 
                    : 'Arraste sua planilha aqui'
                }
              </h3>
              <p className="text-muted-foreground">
                {uploading 
                  ? 'Analisando dados e gerando insights' 
                  : 'Ou clique para selecionar (CSV, XLSX, XLS)'
                }
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {progress}% completo
                </p>
              </div>
            )}

            {!uploading && !uploadComplete && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv,.xlsx,.xls';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) processFile(file);
                  };
                  input.click();
                }}
              >
                Selecionar Arquivo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}