import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  MessageCircle, 
  Minimize2, 
  Maximize2,
  Loader2,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  data: any[];
  dashboardTitle: string;
}

export function AIChat({ data, dashboardTitle }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá! Sou sua assistente de dados inteligente. Posso ajudá-lo a analisar os dados do dashboard "${dashboardTitle}". Posso explicar tendências, calcular métricas e responder perguntas sobre seus ${data.length} registros. Como posso ajudar?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeDataForContext = () => {
    if (!data || data.length === 0) return "Nenhum dado disponível.";
    
    const sample = data[0];
    const columns = Object.keys(sample);
    const numericColumns = columns.filter(col => 
      data.slice(0, 10).every(row => !isNaN(Number(row[col])) && row[col] !== '' && row[col] !== null)
    );
    
    return `Dados disponíveis: ${data.length} registros com colunas: ${columns.join(', ')}. Colunas numéricas: ${numericColumns.join(', ')}.`;
  };

  const generateResponse = async (userMessage: string) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('gemini-chat', {
        body: { 
          message: userMessage, 
          data: data.slice(0, 100), // Limitar dados para evitar payload muito grande
          dashboardTitle 
        }
      });

      if (error) {
        console.error('Erro ao chamar Gemini:', error);
        throw new Error('Erro ao conectar com a IA');
      }

      if (!response.success) {
        throw new Error(response.error || 'Erro na resposta da IA');
      }

      return response.response;
    } catch (error) {
      console.error('Erro na integração Gemini:', error);
      
      // Fallback para resposta local em caso de erro
      if (userMessage.toLowerCase().includes('total') || userMessage.toLowerCase().includes('soma')) {
        const numericColumns = Object.keys(data[0] || {}).filter(col => 
          data.slice(0, 10).every(row => !isNaN(Number(row[col])) && row[col] !== '' && row[col] !== null)
        );
        
        if (numericColumns.length > 0) {
          const totals = numericColumns.map(col => {
            const sum = data.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);
            return `${col}: ${sum.toLocaleString('pt-BR')}`;
          });
          return `Totais calculados:\n${totals.join('\n')}`;
        }
      }
      
      return `Desculpe, não foi possível conectar com a IA no momento. Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente em alguns instantes.`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await generateResponse(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      toast({
        title: "Erro na IA",
        description: "Não foi possível gerar uma resposta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 bg-gradient-primary shadow-mirtilo hover:shadow-premium transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
          IA
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-premium border-2 border-primary/20">
        <CardHeader className="pb-3 bg-gradient-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5" />
              Assistente IA
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[280px] p-3 rounded-lg whitespace-pre-wrap ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  {message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte sobre seus dados..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}