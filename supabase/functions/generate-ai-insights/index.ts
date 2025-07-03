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
    const { dashboardId, data } = await req.json();
    
    if (!dashboardId || !data) {
      throw new Error('Dashboard ID e dados são obrigatórios');
    }

    // Analisar estrutura dos dados
    const columns = Object.keys(data[0] || {});
    const numericColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'number' || !isNaN(Number(row[col])))
    );
    const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

    // Calcular estatísticas básicas
    const insights = {
      summary: {
        totalRecords: data.length,
        totalColumns: columns.length,
        numericColumns: numericColumns.length,
        categoricalColumns: categoricalColumns.length
      },
      statistics: numericColumns.map(col => {
        const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
        return {
          column: col,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          count: values.length
        };
      }),
      patterns: {
        mostFrequentValues: categoricalColumns.map(col => {
          const counts: Record<string, number> = {};
          data.forEach(row => {
            const value = String(row[col] || '');
            counts[value] = (counts[value] || 0) + 1;
          });
          const sorted = Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
          return { column: col, values: sorted };
        })
      },
      recommendations: [
        {
          type: 'visualization',
          title: 'Gráficos Recomendados',
          content: numericColumns.length > 0 
            ? 'Considere criar gráficos de linha ou barras para colunas numéricas'
            : 'Considere criar gráficos de pizza para dados categóricos'
        },
        {
          type: 'insights',
          title: 'Análise de Dados',
          content: `Dataset contém ${data.length} registros com ${columns.length} colunas. ${
            numericColumns.length > 0 
              ? `${numericColumns.length} colunas numéricas identificadas para análise estatística.`
              : 'Dados principalmente categóricos - análise de frequência recomendada.'
          }`
        }
      ]
    };

    // Salvar insights no banco
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('ai_analyses')
      .insert({
        dashboard_id: dashboardId,
        analysis_type: 'insights',
        content: insights,
        confidence_score: 0.85,
        model_used: 'statistical-analysis'
      });

    if (error) {
      console.error('Erro ao salvar insights:', error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      insights 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função generate-ai-insights:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});