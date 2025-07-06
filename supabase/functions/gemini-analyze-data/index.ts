import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dashboardId, data, title } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    if (!dashboardId || !data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Dashboard ID e dados são obrigatórios');
    }

    // Analisar estrutura dos dados
    const columns = Object.keys(data[0] || {});
    const sampleData = data.slice(0, 5);
    
    const prompt = `Analise os seguintes dados de planilha e forneça insights detalhados:

Título: ${title || 'Dashboard'}
Total de registros: ${data.length}
Colunas: ${columns.join(', ')}

Amostra dos dados:
${JSON.stringify(sampleData, null, 2)}

Por favor, forneça:
1. Uma descrição do que estes dados representam
2. Insights principais e padrões identificados
3. Métricas importantes calculadas
4. Recomendações de visualizações
5. Sugestões de análises adicionais

Responda em português de forma estruturada e profissional.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Resposta inválida da API do Gemini');
    }

    const analysis = result.candidates[0].content.parts[0].text;

    // Salvar análise no banco
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('ai_analyses')
      .insert({
        dashboard_id: dashboardId,
        analysis_type: 'gemini_analysis',
        content: { analysis, metadata: { model: 'gemini-pro', timestamp: new Date().toISOString() } },
        confidence_score: 0.9,
        model_used: 'gemini-pro'
      });

    if (error) {
      console.error('Erro ao salvar análise:', error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função gemini-analyze-data:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});