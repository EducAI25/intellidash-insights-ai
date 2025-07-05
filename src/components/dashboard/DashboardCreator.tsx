import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';
import { Table } from '@/components/ui/table';

interface DashboardCreatorProps {
  data: any[];
  filename: string;
  uploadId: string;
  columnMappings: Record<string, string>;
  filterColumns: string[];
  onDashboardCreated: (dashboardId: string) => void;
}

export function DashboardCreator({ data, filename, uploadId, columnMappings, filterColumns, onDashboardCreated }: DashboardCreatorProps) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState(filename.replace(/\.[^/.]+$/, ""));
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    console.log('DEBUG: DashboardCreator mounted com uploadId:', uploadId);
    console.log('DEBUG: Props recebidas:', { uploadId, filename, data: data?.length });
  }, [uploadId]);

  const createDashboard = async () => {
    if (!user || !title.trim()) return;

    setCreating(true);
    try {
      console.log('DEBUG: Iniciando criação de dashboard com uploadId:', uploadId);
      
      // Verificar se existem dados para este uploadId antes de criar dashboard
      console.log('DEBUG: Buscando dados com uploadId:', uploadId);
      const { data: existingData, error: checkError } = await supabase
        .from('dashboard_data')
        .select('*')
        .eq('upload_id', uploadId);
      
      console.log('DEBUG: Resultado busca:', { existingData, checkError });
      
      if (checkError) {
        console.error('DEBUG: Erro na busca:', checkError);
        throw checkError;
      }
      
      if (!existingData || existingData.length === 0) {
        console.log('DEBUG: Nenhum dado encontrado para uploadId:', uploadId);
        
        // Buscar todos os registros para debug
        const { data: allData } = await supabase
          .from('dashboard_data')
          .select('upload_id, dashboard_id, original_filename')
          .order('created_at', { ascending: false })
          .limit(10);
        console.log('DEBUG: Últimos 10 registros na tabela:', allData);
        
        toast({
          title: 'Erro ao vincular dados',
          description: 'Dados do upload não encontrados. Faça upload novamente.',
          variant: 'destructive',
        });
        setCreating(false);
        return;
      }

      console.log('DEBUG: Dados encontrados:', existingData.length, 'registros');

      // Criar dashboard
      const { data: dashboard, error: dashboardError } = await supabase
        .from('dashboards')
        .insert({
          user_id: user.id || null,
          title: title.trim(),
          description: description.trim(),
          status: 'draft'
        })
        .select()
        .single();

      if (dashboardError) throw dashboardError;
      console.log('DEBUG: Dashboard criado com ID:', dashboard.id);

      // Atualizar dashboard_data associando ao novo dashboard_id
      console.log('DEBUG: Atualizando registros com uploadId:', uploadId);
      const { data: updatedData, error: updateError } = await supabase
        .from('dashboard_data')
        .update({ 
          dashboard_id: dashboard.id, 
          column_mappings: { columnMappings, filterColumns } 
        })
        .eq('upload_id', uploadId)
        .select();
      
      console.log('DEBUG: Resultado atualização:', { updatedData, updateError });

      if (updateError) throw updateError;
      
      const updateCount = updatedData?.length || 0;
      console.log('DEBUG: Registros atualizados:', updateCount);
      
      if (updateCount === 0) {
        toast({
          title: 'Erro ao vincular dados',
          description: 'Não foi possível associar os dados ao dashboard. Tente novamente.',
          variant: 'destructive',
        });
        setCreating(false);
        return;
      }

      // Gerar análise inicial da IA (chamará edge function)
      const { error: aiError } = await supabase.functions.invoke('generate-ai-insights', {
        body: {
          dashboardId: dashboard.id,
          data: data.slice(0, 100) // Enviar amostra dos dados
        }
      });

      if (aiError) {
        console.warn('Erro ao gerar insights da IA:', aiError);
      }

      toast({
        title: 'Dashboard criado com sucesso!',
        description: 'Seus dados foram processados e estão prontos para visualização',
      });

      onDashboardCreated(dashboard.id);

    } catch (error: any) {
      console.error('Erro ao criar dashboard:', error);
      toast({
        title: 'Erro ao criar dashboard',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Criar Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título do Dashboard</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome do seu dashboard"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o que este dashboard representa..."
            rows={3}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Preview dos dados enviados:</h4>
          <p className="text-sm text-muted-foreground mb-2">
            • {data.length} registros • {Object.keys(data[0] || {}).length} colunas • Arquivo: {filename}
          </p>
          {data && data.length > 0 && (
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
                  {data.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Object.keys(data[0]).map((col) => (
                        <td key={col} className="px-2 py-1">{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <div className="text-xs text-muted-foreground p-2">...e mais {data.length - 5} linhas</div>
              )}
            </div>
          )}
        </div>

        <Button 
          onClick={createDashboard}
          disabled={creating || !title.trim()}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {creating ? 'Criando Dashboard...' : 'Criar Dashboard'}
        </Button>
      </CardContent>
    </Card>
  );
}