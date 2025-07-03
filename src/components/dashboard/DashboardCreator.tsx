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

      // Associar dados ao dashboard
      const { error: dataError } = await supabase
        .from('dashboard_data')
        .insert({
          dashboard_id: dashboard.id,
          original_filename: filename,
          file_size: 0,
          mime_type: 'application/json',
          raw_data: data,
          processed_data: data
        });

      if (dataError) throw dataError;

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
          <h4 className="font-medium mb-2">Dados carregados:</h4>
          <p className="text-sm text-muted-foreground">
            • {data.length} registros
          </p>
          <p className="text-sm text-muted-foreground">
            • {Object.keys(data[0] || {}).length} colunas
          </p>
          <p className="text-sm text-muted-foreground">
            • Arquivo: {filename}
          </p>
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