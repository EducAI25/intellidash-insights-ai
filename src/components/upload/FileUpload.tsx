import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

interface Sheet {
  name: string;
  data: any[];
  preview: string[];
}

interface FileUploadProps {
  onDataProcessed: (data: any[], filename: string, uploadId: string, sheets?: Sheet[]) => void;
}

export function FileUpload({ onDataProcessed }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const processFile = useCallback(async (file: File) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer upload",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadComplete(false);

    try {
      const uploadId = uuidv4();
      console.log('Upload iniciado:', { uploadId, filename: file.name, userId: user.id });

      setProgress(20);

      let data: any[] = [];
      let sheets: Sheet[] = [];
      let valid = false;
      let errorMsg = '';
      
      // Validar extensão do arquivo
      const allowedExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error('Formato de arquivo não suportado. Use apenas CSV, XLSX ou XLS.');
      }
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        setProgress(40);
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        });
        data = result.data;
        valid = Array.isArray(data) && data.length > 0;
        if (!valid) errorMsg = 'O arquivo CSV está vazio ou inválido.';
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        setProgress(40);
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Processar todas as abas
        sheets = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          let sheetData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          });
          
          if (sheetData.length > 1) {
            const headers = sheetData[0] as string[];
            const processedData = sheetData.slice(1).map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = (row as any[])[index] || '';
              });
              return obj;
            });
            
            return {
              name: sheetName,
              data: processedData,
              preview: headers.slice(0, 5)
            };
          }
          return {
            name: sheetName,
            data: [],
            preview: []
          };
        }).filter(sheet => sheet.data.length > 0);
        
        // Usar primeira aba como padrão
        if (sheets.length > 0) {
          data = sheets[0].data;
          valid = true;
        } else {
          errorMsg = 'A planilha está vazia ou inválida.';
        }
      } else {
        errorMsg = 'Formato de arquivo não suportado.';
      }

      if (!valid) {
        throw new Error(errorMsg);
      }

      setProgress(60);

      // Upload para Supabase Storage com nome sanitizado
      const uniqueId = uuidv4();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${user.id}/${uniqueId}-${sanitizedFileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('dashboard-files')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        console.error('Erro no upload para storage:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      setProgress(80);

      // Salvar metadados no banco com user_id
      const dashboardDataObj = {
        user_id: user.id,
        dashboard_id: null,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        raw_data: data,
        processed_data: data,
        upload_id: uploadId
      };

      console.log('Salvando dados no banco:', { uploadId, userId: user.id, filename: file.name });
      
      const { error: dbError } = await supabase
        .from('dashboard_data')
        .insert(dashboardDataObj);

      if (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        throw dbError;
      }

      setProgress(100);
      setUploadComplete(true);

      toast({
        title: "Arquivo processado com sucesso!",
        description: `${data.length} registros carregados de ${file.name}`,
      });

      onDataProcessed(data, file.name, uploadId, sheets.length > 1 ? sheets : undefined);

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
              ? 'border-primary bg-primary/10' 
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