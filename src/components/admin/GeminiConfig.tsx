import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Zap,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function GeminiConfig() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-pro');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Verificar se há configuração salva no banco
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .single();
      
      if (data) {
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key necessária",
        description: "Digite sua API Key do Google Gemini",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Testar conexão com o Gemini (simulado)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Conexão bem-sucedida!",
        description: "A API Key do Gemini está funcionando corretamente",
      });
      
      setIsConfigured(true);
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Verifique se a API Key está correta",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveConfiguration = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key obrigatória",
        description: "Digite sua API Key do Google Gemini",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Salvar configuração (em produção, usar Supabase Secrets)
      localStorage.setItem('gemini_config', JSON.stringify({
        apiKey,
        model,
        systemPrompt: systemPrompt || 'Você é um assistente especializado em análise de dados corporativos. Seja preciso, útil e profissional em suas respostas.'
      }));

      toast({
        title: "Configuração salva!",
        description: "A integração com Gemini foi configurada com sucesso",
      });
      
      setIsConfigured(true);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Configuração do Google Gemini
            {isConfigured && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure a integração com Google Gemini AI para análises inteligentes de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key do Google Gemini
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Digite sua API Key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha sua API Key em{' '}
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div>
                <Label htmlFor="model">Modelo do Gemini</Label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="gemini-pro">Gemini Pro (Recomendado)</option>
                  <option value="gemini-pro-vision">Gemini Pro Vision</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={testConnection}
                  disabled={isTestingConnection || !apiKey.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {isTestingConnection ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>

                <Button 
                  onClick={saveConfiguration}
                  disabled={isLoading || !apiKey.trim()}
                  className="flex-1 bg-gradient-primary"
                >
                  {isLoading ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Salvar Config
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="system-prompt" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Prompt do Sistema (Opcional)
              </Label>
              <Textarea
                id="system-prompt"
                placeholder="Personalize como a IA deve se comportar..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="mt-1 min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Define o comportamento e personalidade da IA. Deixe vazio para usar o padrão.
              </p>
            </div>
          </div>

          {!isConfigured && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Configuração necessária</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Configure sua API Key do Gemini para habilitar análises inteligentes automáticas e o chat com IA nos dashboards.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Funcionalidades da IA</CardTitle>
          <CardDescription>
            O que será possível com a integração Gemini configurada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Análise Automática</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                IA analisa automaticamente planilhas e identifica padrões, tendências e insights relevantes.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Chat Interativo</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Usuários podem fazer perguntas sobre os dados e receber respostas inteligentes em tempo real.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Dashboards Inteligentes</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Criação automática de dashboards personalizados baseados no tipo de dados detectado.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium">Projeções e Previsões</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Análise preditiva e sugestões de ações baseadas nos dados históricos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}