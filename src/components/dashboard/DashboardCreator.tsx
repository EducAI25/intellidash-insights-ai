import { useState } from 'react';
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
  onDashboardCreated: (dashboardId: string) => void;
}

export function DashboardCreator({ data, filename, onDashboardCreated }: DashboardCreatorProps) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState(filename.replace(/\.[^/.]+$/, ""));
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const createDashboard = async () => {
    if (!user || !title.trim()) return;

    setCreating(true);
    try {
      // Criar dashboard
      const { data: dashboard, error: dashboardError } = await supabase
        .from('dashboards')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          status: 'draft'
        })
        .select()
        .single();

      if (dashboardError) throw dashboardError;

      // Atualizar dashboard_data associando ao novo dashboard_id
      const { error: updateError } = await supabase
        .from('dashboard_data')
        .update({ dashboard_id: dashboard.id })
        .eq('original_filename', filename)
        .eq('dashboard_id', null);

      if (updateError) throw updateError;

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
        title: "Dashboard criado com sucesso!",
        description: "Seus dados foram processados e estão prontos para visualização",
      });

      onDashboardCreated(dashboard.id);

    } catch (error: any) {
      console.error('Erro ao criar dashboard:', error);
      toast({
        title: "Erro ao criar dashboard",
        description: error.message,
        variant: "destructive",
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